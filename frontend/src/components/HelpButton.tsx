import { HelpCircle } from 'lucide-react'
import { Button } from './ui/button';
import { Link } from 'react-router-dom'

function HelpMe() {
    return (
        <Button
            className='p-2 rounded-full cursor-pointer hover:bg-accent transition-colors'
            variant="ghost"
            size="icon"
            title='Guia de orientación'
        >
            <Link to="/home/help">
                <HelpCircle className='h-full w-full' />
            </Link>
        </Button>
    );
}
export default HelpMe;