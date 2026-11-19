interface AppConfig {
  readonly apiBaseUrl: string;
}

function loadAppConfig(): AppConfig {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error(
      'Fehlende Umgebungsvariable: VITE_API_BASE_URL ist in der .env nicht definiert.',
    );
  }

  return {
    apiBaseUrl,
  };
}

export const appConfig = loadAppConfig();
