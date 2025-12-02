import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Wrench, Mail, MessageCircle, Clock, Trophy, Zap, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Logo from '../components/Logo';

interface Obstacle {
    id: number;
    lane: number; // 0, 1, or 2
    position: number;
}

const MaintenancePage: React.FC = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState('Nous effectuons une maintenance pour améliorer votre expérience. Merci de votre patience.');
    const [supportEmail, setSupportEmail] = useState('support@shinobi-rh.com');

    // Game state
    const [gameActive, setGameActive] = useState(false);
    const [score, setScore] = useState(0);
    const [playerLane, setPlayerLane] = useState(1); // 0=left, 1=center, 2=right
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [bestScore, setBestScore] = useState<number>(0);
    const [speed, setSpeed] = useState(20);

    const obstacleIdRef = useRef(0);
    const gameLoopRef = useRef<number>();

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await axiosClient.get('/api/auth/platform/config/');
                if (response.data.maintenance_message) {
                    setMessage(response.data.maintenance_message);
                }
                if (response.data.support_email) {
                    setSupportEmail(response.data.support_email);
                }
            } catch (error) {
                // Use defaults
            }
        };
        fetchConfig();

        const saved = localStorage.getItem('tunnelRunnerBest');
        if (saved) setBestScore(parseInt(saved));
    }, []);

    // Keyboard controls
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!gameActive || gameOver) return;

            if (e.key === 'ArrowLeft' && playerLane > 0) {
                setPlayerLane(p => p - 1);
            } else if (e.key === 'ArrowRight' && playerLane < 2) {
                setPlayerLane(p => p + 1);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameActive, gameOver, playerLane]);

    // Game loop
    useEffect(() => {
        if (!gameActive || gameOver) return;

        const loop = () => {
            // Move obstacles forward
            setObstacles(prev => {
                const updated = prev.map(obs => ({
                    ...obs,
                    position: obs.position + speed
                })).filter(obs => obs.position < 600);

                // Check collision
                const collision = updated.some(
                    obs => obs.lane === playerLane && obs.position > 450 && obs.position < 550
                );

                if (collision) {
                    endGame();
                }

                return updated;
            });

            // Spawn new obstacles
            if (Math.random() < 0.02) {
                const lanes = [0, 1, 2];
                const randomLane = lanes[Math.floor(Math.random() * lanes.length)];

                setObstacles(prev => [...prev, {
                    id: obstacleIdRef.current++,
                    lane: randomLane,
                    position: -100
                }]);
            }

            // Increase score
            setScore(s => s + 1);

            // Increase speed gradually
            setSpeed(s => Math.min(s + 0.01, 40));

            gameLoopRef.current = requestAnimationFrame(loop);
        };

        gameLoopRef.current = requestAnimationFrame(loop);

        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [gameActive, gameOver, playerLane, speed]);

    const startGame = () => {
        setGameActive(true);
        setScore(0);
        setPlayerLane(1);
        setObstacles([]);
        setGameOver(false);
        setSpeed(20);
        obstacleIdRef.current = 0;
    };

    const endGame = () => {
        setGameOver(true);
        setGameActive(false);
        if (score > bestScore) {
            setBestScore(score);
            localStorage.setItem('tunnelRunnerBest', score.toString());
        }
    };

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Purple Glow */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
                <div className="max-w-6xl w-full">
                    <button
                        onClick={() => navigate('/')}
                        className="mb-8 flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Retour</span>
                    </button>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Info Card (1/3) */}
                        <div className="bg-zinc-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8">
                            <div className="flex justify-center mb-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-purple-600/20 blur-xl rounded-2xl"></div>
                                    <div className="relative">
                                        <Logo size="sm" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center mb-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-purple-600/30 rounded-full blur-xl"></div>
                                    <div className="relative bg-purple-600/20 p-4 rounded-full border border-purple-500/30">
                                        <Wrench className="w-8 h-8 text-purple-400" />
                                    </div>
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold text-white mb-2 text-center">
                                Maintenance
                            </h1>

                            <div className="flex items-center justify-center gap-2 text-purple-300 mb-6 text-sm">
                                <Clock className="w-3 h-3" />
                                <span className="text-xs">Retour très bientôt</span>
                            </div>

                            <div className="bg-black/40 border border-purple-500/20 rounded-xl p-4 mb-4 text-left">
                                <div className="flex items-start gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                        DA
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-purple-300 text-xs font-semibold mb-1">
                                            Message du DG
                                        </p>
                                        <p className="text-purple-200/80 text-xs mb-2">
                                            Mr DIARRA ALASSANE
                                        </p>
                                        <p className="text-gray-300 text-xs leading-relaxed">
                                            {message}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                <a
                                    href={`mailto:${supportEmail}`}
                                    className="bg-black/40 border border-purple-500/20 rounded-lg p-2 hover:border-purple-500/40 transition-all group"
                                >
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-purple-400" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="text-xs text-purple-300 truncate">{supportEmail}</p>
                                        </div>
                                    </div>
                                </a>

                                <a
                                    href="https://wa.me/22366826207"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-black/40 border border-purple-500/20 rounded-lg p-2 hover:border-green-500/40 transition-all group"
                                >
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="w-4 h-4 text-green-400" />
                                        <div>
                                            <p className="text-xs text-gray-500">WhatsApp</p>
                                            <p className="text-xs text-green-300">+223 66 82 62 07</p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Game Card (2/3) */}
                        <div className="lg:col-span-2 bg-zinc-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Tunnel Runner 3D</h2>
                                        <p className="text-xs text-gray-400">Utilisez ← → pour jouer</p>
                                    </div>
                                </div>
                                {bestScore > 0 && (
                                    <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-1">
                                        <Trophy className="w-4 h-4 text-yellow-400" />
                                        <span className="text-sm font-bold text-yellow-400">{bestScore}</span>
                                    </div>
                                )}
                            </div>

                            {!gameActive && !gameOver ? (
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce">
                                        <Play className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-white text-xl font-bold mb-3">Prêt à jouer ?</h3>
                                    <p className="text-gray-400 text-sm mb-8">
                                        Évitez les obstacles dans le tunnel spatial !<br />
                                        Utilisez les flèches ← et → pour vous déplacer
                                    </p>
                                    <button
                                        onClick={startGame}
                                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
                                    >
                                        Démarrer le jeu
                                    </button>
                                </div>
                            ) : gameOver ? (
                                <div className="text-center py-20">
                                    <div className="text-6xl mb-4">💥</div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Game Over!</h3>
                                    <p className="text-purple-300 text-lg mb-2">Score: {score}</p>
                                    {score === bestScore && score > 0 && (
                                        <p className="text-yellow-400 text-sm mb-6">🏆 Nouveau record !</p>
                                    )}
                                    <button
                                        onClick={startGame}
                                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all transform hover:scale-105"
                                    >
                                        Rejouer
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Score */}
                                    <div className="text-center mb-6">
                                        <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">
                                            {score}
                                        </p>
                                        <p className="text-xs text-gray-500">SCORE</p>
                                    </div>

                                    {/* 3D Game Area */}
                                    <div className="relative h-96 bg-gradient-to-b from-black via-purple-950/20 to-black rounded-xl overflow-hidden border-2 border-purple-500/30"
                                        style={{ perspective: '600px' }}
                                    >
                                        {/* Tunnel effect */}
                                        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
                                            {/* Grid lines for depth */}
                                            {[...Array(10)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="absolute left-0 right-0 border-t border-purple-500/10"
                                                    style={{
                                                        top: `${i * 10}%`,
                                                        transform: `translateZ(${-i * 50}px)`,
                                                    }}
                                                />
                                            ))}

                                            {/* Side walls */}
                                            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-purple-500/30 to-transparent"></div>
                                            <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-purple-500/30 to-transparent"></div>
                                        </div>

                                        {/* Obstacles */}
                                        {obstacles.map(obs => (
                                            <div
                                                key={obs.id}
                                                className="absolute w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-lg shadow-lg shadow-red-500/50"
                                                style={{
                                                    left: obs.lane === 0 ? '25%' : obs.lane === 1 ? '50%' : '75%',
                                                    transform: `translateX(-50%) translateY(${obs.position}px) scale(${1 - obs.position / 1000})`,
                                                    top: '0',
                                                }}
                                            />
                                        ))}

                                        {/* Player */}
                                        <div
                                            className="absolute bottom-20 w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-lg shadow-purple-500/50 transition-all duration-200"
                                            style={{
                                                left: playerLane === 0 ? '25%' : playerLane === 1 ? '50%' : '75%',
                                                transform: 'translateX(-50%)',
                                            }}
                                        />

                                        {/* Speed indicator */}
                                        <div className="absolute bottom-4 right-4 text-purple-300 text-xs">
                                            Vitesse: {Math.round(speed)}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <p className="text-center text-zinc-600 text-xs mt-6">
                        © 2025 SHINOBI RH - Tous droits réservés
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.1; }
                    50% { opacity: 0.15; }
                }
                
                .animate-pulse-slow {
                    animation: pulse-slow 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default MaintenancePage;
