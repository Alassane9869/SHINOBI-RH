import { AxiosError } from 'axios';

// Type pour les réponses d'erreur du backend Django
interface DjangoErrorResponse {
    detail?: string;
    [key: string]: any;
}

// Type guard pour vérifier si c'est une erreur Axios
export function isAxiosError(error: any): error is AxiosError<DjangoErrorResponse> {
    return error.isAxiosError === true;
}

// Helper pour extraire le message d'erreur de manière sûre
export function getErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        const data = error.response?.data;
        if (data) {
            if (typeof data.detail === 'string') {
                return data.detail;
            }
            // Essayer d'extraire les erreurs de validation
            const values = Object.values(data).filter(v => typeof v === 'string');
            if (values.length > 0) {
                return values.join(', ');
            }
        }
        return error.message || 'Une erreur est survenue';
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'Une erreur est survenue';
}
