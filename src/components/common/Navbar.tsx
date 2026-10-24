import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Link, useRouterState } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { ModeToggle } from './ModeToggle'

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const pathname = useRouterState({ select: (state) => state.location.pathname })
    if (pathname.startsWith('/court')) return null

    return (
        <header
            className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-background/80 border-border border-b backdrop-blur-md'
                : 'bg-transparent'
                }`}
        >
            <div className="page-container py-4">
                <nav className="flex items-center justify-between">
                    <Link
                        to="/"
                        className="hover:text-muted-foreground font-mono text-sm font-medium transition-colors"
                    >
                        Mps
                    </Link>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" asChild className="text-xs">
                            <a
                                href="https://docs.google.com/document/d/15emkkk3uECevTU2SMT8q4aD8fpdu9tF-E33ha0YTrgA/edit?tab=t.0"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Resume
                                <ArrowUpRight className="size-3" />
                            </a>
                        </Button>
                        <ModeToggle />
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Navbar
