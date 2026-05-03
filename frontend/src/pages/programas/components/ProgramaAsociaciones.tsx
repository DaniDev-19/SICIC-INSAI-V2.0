import { usePrograma } from '@/hooks/use-programas';
import { AsociacionCard } from './AsociacionCard';
import { Sprout, Bug, Stethoscope, PawPrint, Loader2 } from 'lucide-react';
import { useCultivos } from '@/hooks/use-cultivos';
import { usePlagas } from '@/hooks/use-plagas';
import { useEnfermedades } from '@/hooks/use-enfermedades';
import { useAnimales } from '@/hooks/use-animales';
import { programasService } from '@/services/programas.service';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ProgramaAsociacionesProps {
  programaId: number;
  programaNombre: string;
}

export function ProgramaAsociaciones({ programaId, programaNombre }: ProgramaAsociacionesProps) {
  const { programa, isLoading } = usePrograma(programaId);
  const queryClient = useQueryClient();

  const cultivos = programa?.programa_cultivo?.map((pc) => pc.cultivo) || [];
  const plagas = programa?.programa_plaga?.map((pp) => pp.plagas) || [];
  const enfermedades = programa?.programa_enfermedades?.map((pe) => pe.enfermedades) || [];
  const animales = programa?.programa_animales?.map((pa) => pa.animales) || [];

  const cultivosQuery = useCultivos();
  const plagasQuery = usePlagas();
  const enfermedadesQuery = useEnfermedades();
  const animalesQuery = useAnimales();

  const handleAdd = async (type: 'cultivos' | 'plagas' | 'enfermedades' | 'animales', id: number) => {
    if (!programa) return;

    const dataToSend = {
      cultivos_ids: cultivos.map(c => c.id),
      plagas_ids: plagas.map(p => p.id),
      enfermedades_ids: enfermedades.map(e => e.id),
      animales_ids: animales.map(a => a.id),
    };

    if (dataToSend[`${type}_ids`].includes(id)) {
      toast.error('Este elemento ya está asociado.');
      return;
    }

    dataToSend[`${type}_ids`].push(id);

    try {
      await programasService.update(programa.id, dataToSend);
      queryClient.invalidateQueries({ queryKey: ['programa', programa.id] });
      toast.success('Asociación agregada correctamente');
    } catch (error) {
      toast.error('Error al agregar asociación');
    }
  };

  const handleRemove = async (type: 'cultivos' | 'plagas' | 'enfermedades' | 'animales', id: number) => {
    if (!programa) return;

    const dataToSend = {
      cultivos_ids: cultivos.map(c => c.id).filter(cid => type !== 'cultivos' || cid !== id),
      plagas_ids: plagas.map(p => p.id).filter(pid => type !== 'plagas' || pid !== id),
      enfermedades_ids: enfermedades.map(e => e.id).filter(eid => type !== 'enfermedades' || eid !== id),
      animales_ids: animales.map(a => a.id).filter(aid => type !== 'animales' || aid !== id),
    };

    try {
      await programasService.update(programa.id, dataToSend);
      queryClient.invalidateQueries({ queryKey: ['programa', programa.id] });
      toast.success('Asociación removida correctamente');
    } catch (error) {
      toast.error('Error al remover asociación');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12 bg-card rounded-2xl border border-border shadow-xl glass-effect">
        <Loader2 className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xl glass-effect p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <Stethoscope className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Asociaciones Estratégicas</h2>
          <p className="text-sm text-muted-foreground font-medium">Gestionando las áreas de impacto de: <strong className="text-primary">{programaNombre}</strong></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AsociacionCard
          title="Enfermedades a Controlar"
          icon={<Stethoscope className="size-5 text-rose-500" />}
          colorClass="bg-rose-500/10 border-rose-500/20 text-rose-500"
          items={enfermedades}
          onRemove={(id) => handleRemove('enfermedades', id)}
          onAdd={(id) => handleAdd('enfermedades', id)}
          catalogItems={enfermedadesQuery.enfermedades}
          search={enfermedadesQuery.search}
          onSearchChange={enfermedadesQuery.setSearch}
          placeholder="Buscar enfermedad..."
        />

        <AsociacionCard
          title="Plagas a Controlar"
          icon={<Bug className="size-5 text-amber-500" />}
          colorClass="bg-amber-500/10 border-amber-500/20 text-amber-500"
          items={plagas}
          onRemove={(id) => handleRemove('plagas', id)}
          onAdd={(id) => handleAdd('plagas', id)}
          catalogItems={plagasQuery.plagas}
          search={plagasQuery.search}
          onSearchChange={plagasQuery.setSearch}
          placeholder="Buscar plaga..."
        />

        <AsociacionCard
          title="Cultivos a Proteger"
          icon={<Sprout className="size-5 text-emerald-500" />}
          colorClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
          items={cultivos}
          onRemove={(id) => handleRemove('cultivos', id)}
          onAdd={(id) => handleAdd('cultivos', id)}
          catalogItems={cultivosQuery.cultivos}
          search={cultivosQuery.search}
          onSearchChange={cultivosQuery.setSearch}
          placeholder="Buscar cultivo..."
        />

        <AsociacionCard
          title="Animales a Proteger"
          icon={<PawPrint className="size-5 text-blue-500" />}
          colorClass="bg-blue-500/10 border-blue-500/20 text-blue-500"
          items={animales}
          onRemove={(id) => handleRemove('animales', id)}
          onAdd={(id) => handleAdd('animales', id)}
          catalogItems={animalesQuery.animales}
          search={animalesQuery.search}
          onSearchChange={animalesQuery.setSearch}
          placeholder="Buscar animal..."
        />
      </div>
    </div>
  );
}
