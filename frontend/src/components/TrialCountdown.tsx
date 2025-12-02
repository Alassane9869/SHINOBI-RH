import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import useAuthStore from '../auth/AuthStore';
import { useNavigate } from 'react-router-dom';

const TrialCountdown: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const trialEndDate = user?.company?.trial_end_date;
            if (!trialEndDate) return;

            const end = new Date(trialEndDate);
            const now = new Date();
            const diff = end.getTime() - now.getTime();

            if (diff <= 0) {
                setIsExpired(true);
                setTimeLeft('Expiré');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
                setTimeLeft(`${days}j ${hours}h`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m`);
            } else {
                setTimeLeft(`${minutes}m`);
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [user?.company?.trial_end_date]);

    // Only show for trial users
    if (user?.company?.subscription_status !== 'trial' || !user?.company?.trial_end_date) {
        return null;
    }

    return (
        <button
            onClick={() => navigate('/pricing')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${isExpired
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20'
                }`}
            title="Cliquez pour passer au plan Pro"
        >
            {isExpired ? (
                <AlertCircle className="w-4 h-4" />
            ) : (
                <Clock className="w-4 h-4" />
            )}
            <span>
                {isExpired ? 'Essai expiré' : `Essai: ${timeLeft}`}
            </span>
        </button>
    );
};

export default TrialCountdown;
