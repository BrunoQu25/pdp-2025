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
    username: 'Brux',
    displayName: 'Brux',
    photoUrl: 'avatar-brux.jpg',
    points: 0,
    authorizedEmail: 'brunoesbolso2001@gmail.com'
  },
  {
    id: '2',
    username: 'Gordo',
    displayName: 'Gordo',
    photoUrl: 'avatar-gordo.jpg',
    points: 0,
    authorizedEmail: 'gordo@example.com'
  },
  {
    id: '3',
    username: 'Fela',
    displayName: 'Fela',
    photoUrl: 'avatar-fela.jpg',
    points: 0,
    authorizedEmail: 'fela@example.com'
  },
  {
    id: '4',
    username: 'Loca',
    displayName: 'Loca',
    photoUrl: 'avatar-loca.jpg',
    points: 0,
    authorizedEmail: 'loca@example.com'
  },
  {
    id: '5',
    username: 'Nachein',
    displayName: 'Nachein',
    photoUrl: 'avatar-nachein.jpg',
    points: 0,
    authorizedEmail: 'nachein@example.com'
  },
  {
    id: '6',
    username: 'Andi',
    displayName: 'Andi',
    photoUrl: 'avatar-andi.jpg',
    points: 0,
    authorizedEmail: 'andi@example.com'
  },
  {
    id: '7',
    username: 'Aguslo',
    displayName: 'Aguslo',
    photoUrl: 'avatar-aguslo.jpg',
    points: 0,
    authorizedEmail: 'aguslo@example.com'
  },
  {
    id: '8',
    username: 'Octo',
    displayName: 'Octo',
    photoUrl: 'avatar-octo.jpg',
    points: 0,
    authorizedEmail: 'octo@example.com'
  },
  {
    id: '9',
    username: 'Casti',
    displayName: 'Casti',
    photoUrl: 'avatar-casti.jpg',
    points: 0,
    authorizedEmail: 'casti@example.com'
  },
  {
    id: '10',
    username: 'Juanmalore',
    displayName: 'Juanmalore',
    photoUrl: 'avatar-juanmalore.jpg',
    points: 0,
    authorizedEmail: 'juanmalore@example.com'
  },
  {
    id: '11',
    username: 'Harry',
    displayName: 'Harry',
    photoUrl: 'avatar-harry.jpg',
    points: 0,
    authorizedEmail: 'harry@example.com'
  },
  {
    id: '12',
    username: 'Nicofer',
    displayName: 'Nicofer',
    photoUrl: 'avatar-nicofer.jpg',
    points: 0,
    authorizedEmail: 'nicofer@example.com'
  },
  {
    id: '13',
    username: 'Sopa',
    displayName: 'Sopa',
    photoUrl: 'avatar-sopa.jpg',
    points: 0,
    authorizedEmail: 'sopa@example.com'
  },
  {
    id: '14',
    username: 'Krugi',
    displayName: 'Krugi',
    photoUrl: 'avatar-krugi.jpg',
    points: 0,
    authorizedEmail: 'krugi@example.com'
  },
  {
    id: '15',
    username: 'Bri',
    displayName: 'Bri',
    photoUrl: 'avatar-bri.jpg',
    points: 0,
    authorizedEmail: 'bri@example.com'
  },
  {
    id: '16',
    username: 'Gabo',
    displayName: 'Gabo',
    photoUrl: 'avatar-gabo.jpg',
    points: 0,
    authorizedEmail: 'gabo@example.com'
  },
  {
    id: '17',
    username: 'Tincho',
    displayName: 'Tincho',
    photoUrl: 'avatar-tincho.jpg',
    points: 0,
    authorizedEmail: 'tincho@example.com'
  },
  {
    id: '18',
    username: 'Dyzer',
    displayName: 'Dyzer',
    photoUrl: 'avatar-dyzer.jpg',
    points: 0,
    authorizedEmail: 'dyzer@example.com'
  }
];

