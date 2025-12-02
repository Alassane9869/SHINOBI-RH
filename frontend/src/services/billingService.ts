import axiosClient from '../api/axiosClient';

export interface SubscriptionPlan {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    period: 'monthly' | 'yearly';
    max_employees: number | null;
    max_users: number | null;
    features: Record<string, any>;
    is_active: boolean;
    is_popular: boolean;
}

export interface Subscription {
    id: number;
    plan: SubscriptionPlan;
    status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
    start_date: string;
    end_date: string | null;
    next_billing_date: string | null;
    auto_renew: boolean;
}

export interface Payment {
    id: number;
    amount: number;
    currency: string;
    payment_method: string;
    status: string;
    transaction_id: string;
    paid_at: string | null;
    created_at: string;
}

export interface Invoice {
    id: number;
    invoice_number: string;
    amount: number;
    currency: string;
    issue_date: string;
    is_paid: boolean;
    pdf_file: string | null;
}

const billingService = {
    // Plans
    async getPlans(): Promise<SubscriptionPlan[]> {
        const response = await axiosClient.get('/api/billing/plans/');
        return response.data;
    },

    // Subscription
    async getCurrentSubscription(): Promise<Subscription> {
        const response = await axiosClient.get('/api/billing/subscription/');
        return response.data;
    },

    async subscribe(planId: number, paymentMethod: string): Promise<any> {
        const response = await axiosClient.post('/api/billing/subscribe/', {
            plan_id: planId,
            payment_method: paymentMethod
        });
        return response.data;
    },

    async subscribeFree(planId: number): Promise<any> {
        const response = await axiosClient.post('/api/billing/subscribe/free/', {
            plan_id: planId
        });
        return response.data;
    },

    async cancelSubscription(): Promise<void> {
        await axiosClient.post('/api/billing/cancel/');
    },

    async upgradeSubscription(planId: number): Promise<void> {
        await axiosClient.post('/api/billing/upgrade/', { plan_id: planId });
    },

    // Payments
    async createStripePaymentIntent(subscriptionId: number, amount: number): Promise<any> {
        const response = await axiosClient.post('/api/billing/payment/stripe/', {
            subscription_id: subscriptionId,
            amount
        });
        return response.data;
    },

    async createOrangeMoneyPayment(subscriptionId: number, amount: number, phoneNumber: string): Promise<any> {
        const response = await axiosClient.post('/api/billing/payment/orange/', {
            subscription_id: subscriptionId,
            amount,
            phone_number: phoneNumber
        });
        return response.data;
    },

    async createMoovMoneyPayment(subscriptionId: number, amount: number, phoneNumber: string): Promise<any> {
        const response = await axiosClient.post('/api/billing/payment/moov/', {
            subscription_id: subscriptionId,
            amount,
            phone_number: phoneNumber
        });
        return response.data;
    },

    async getPaymentHistory(): Promise<Payment[]> {
        const response = await axiosClient.get('/api/billing/payments/');
        return response.data;
    },

    // Invoices
    async getInvoices(): Promise<Invoice[]> {
        const response = await axiosClient.get('/api/billing/invoices/');
        return response.data;
    },

    async downloadInvoice(invoiceId: number): Promise<Blob> {
        const response = await axiosClient.get(`/api/billing/invoices/${invoiceId}/download/`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // Promo codes
    async applyPromoCode(code: string, planId: number): Promise<any> {
        const response = await axiosClient.post('/api/billing/promo/apply/', {
            code,
            plan_id: planId
        });
        return response.data;
    }
};

export default billingService;
