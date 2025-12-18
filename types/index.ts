export interface User {
  id: string;
  username: string;
  displayName: string;
  photoUrl: string;
  points: number;
  authorizedEmail?: string; // Email de Google autorizado para este usuario
}

export interface Drink {
  id: string;
  userId: string;
  username: string;
  size: 'Cervecita' | 'Caipi/Daiki' | 'Cerveza' | 'Trago' | 'Loca Shot' | 'Triple Loca Shot';
  points: number;
  photoUrl: string;
  timestamp: Date;
  votes: string[]; // Array of user IDs who voted against this drink
  deleted: boolean;
  deletedAt?: Date;
}

export const DRINK_POINTS = {
  'Cervecita': 1,
  'Caipi/Daiki': 1.5,
  'Cerveza': 2,
  'Trago': 2,
  'Loca Shot': 3,
  'Triple Loca Shot': 12
} as const;

// Helper function to get avatar URL
export const getAvatarUrl = (filename: string): string => {
  // Check if we have Azure configured
  if (typeof window !== 'undefined') {
    // Client side - use NEXT_PUBLIC_ variable
    const account = process.env.NEXT_PUBLIC_AZURE_STORAGE_ACCOUNT_NAME;
    if (account) {
      return `https://${account}.blob.core.windows.net/avatars/${filename}`;
    }
  }
  // Fallback to local
  return `/avatars/${filename}`;
};

export const HARDCODED_USERS: User[] = [
  {
    id: '1',
    username: 'bruno',
    displayName: 'Bruno',
    photoUrl: 'avatar-bruno.jpg',
    points: 0,
    authorizedEmail: 'bruno.monteoliva@gmail.com' // Cambiar por el email real de Bruno
  },
  {
    id: '2',
    username: 'joão',
    displayName: 'João',
    photoUrl: 'avatar-joao.jpg',
    points: 0,
    authorizedEmail: 'joao@example.com' // Cambiar por el email real de João
  },
  {
    id: '3',
    username: 'pedro',
    displayName: 'Pedro',
    photoUrl: 'avatar-pedro.jpg',
    points: 0,
    authorizedEmail: 'pedro@example.com' // Cambiar por el email real de Pedro
  },
  {
    id: '4',
    username: 'miguel',
    displayName: 'Miguel',
    photoUrl: 'avatar-miguel.jpg',
    points: 0,
    authorizedEmail: 'miguel@example.com' // Cambiar por el email real de Miguel
  }
];

