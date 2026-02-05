export {};

declare global {
  interface TelegramWebAppUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  }

  interface TelegramWebAppInitData {
    user?: TelegramWebAppUser;
  }

  interface TelegramWebApp {
    initDataUnsafe?: TelegramWebAppInitData;
    initData?: string;
    ready?: () => void;
    expand?: () => void;
    openTelegramLink?: (url: string) => void;
  }

  interface TelegramNamespace {
    WebApp?: TelegramWebApp;
  }

  interface Window {
    Telegram?: TelegramNamespace;
  }
}
