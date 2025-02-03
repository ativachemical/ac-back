export interface RecaptchaResponse {
    success: boolean;
    message: string;
    timestamp?: string; // Adicionando um campo extra (opcional) para data/hora
    data?: any; // Você pode adicionar um campo extra para armazenar dados adicionais, caso necessário
}