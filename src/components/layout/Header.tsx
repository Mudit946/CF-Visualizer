import { Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
    return (
        <header className="border-b border-cf-border bg-cf-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-cf-primary/10 p-2 rounded-lg group-hover:bg-cf-primary/20 transition-colors">
                        <Activity className="h-5 w-5 text-cf-primary" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">
                        Codeforces <span className="text-cf-primary">Visualizer</span>
                    </span>
                </Link>
                <div className="flex items-center gap-4">
                    <a
                        href="https://github.com/codeforces"
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        GitHub
                    </a>
                </div>
            </div>
        </header>
    );
}
