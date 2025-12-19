
import { Couple, RegistrationStatus, ChatMessage, ApostolicRegion, ECCStage, ECCSong, User, ECCEvent, EventAttendee, ECCNotification } from '../types';

const STORAGE_KEY = 'ecc_couples_db';
const CHAT_KEY = 'ecc_chat_messages';
const REGIONS_KEY = 'ecc_apostolic_regions';
const SONGS_KEY = 'ecc_songs_db';
const USERS_KEY = 'ecc_users_accounts';
const EVENTS_KEY = 'ecc_events_agenda';
const NOTIFICATIONS_KEY = 'ecc_notifications_db';

export const storageService = {
  // Gestão de Usuários (Contas)
  getUsers: (): (User & { password?: string })[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUser: (user: User & { password?: string }) => {
    const users = storageService.getUsers();
    if (users.find(u => u.email === user.email)) {
      throw new Error("Este e-mail já possui um acesso cadastrado.");
    }
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  findUser: (email: string, password?: string): User | null => {
    const users = storageService.getUsers();
    const user = users.find(u => u.email === email && (!password || u.password === password));
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    }
    return null;
  },

  // Casais
  getCouples: (): Couple[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveCouple: (couple: Couple) => {
    const couples = storageService.getCouples();
    const existingIndex = couples.findIndex(c => c.id === couple.id);
    if (existingIndex >= 0) {
      couples[existingIndex] = couple;
    } else {
      couples.push(couple);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(couples));
  },

  approveCouple: (id: string) => {
    const couples = storageService.getCouples().map(c => 
      c.id === id ? { ...c, status: RegistrationStatus.APPROVED } : c
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(couples));
  },

  rejectCouple: (id: string) => {
    const couples = storageService.getCouples().map(c => 
      c.id === id ? { ...c, status: RegistrationStatus.REJECTED } : c
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(couples));
  },

  getMessages: (): ChatMessage[] => {
    const data = localStorage.getItem(CHAT_KEY);
    return data ? JSON.parse(data) : [];
  },

  sendMessage: (message: ChatMessage) => {
    const messages = storageService.getMessages();
    messages.push(message);
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-100)));
  },

  getSongs: (): ECCSong[] => {
    const data = localStorage.getItem(SONGS_KEY);
    if (!data) {
      const initial: ECCSong[] = [
        {
          id: 's1',
          title: 'Oração pela Família',
          author: 'Padre Zezinho',
          stage: ECCStage.FIRST,
          category: 'Espiritualidade',
          lyrics: 'Que nenhuma família comece em qualquer de repente\nQue nenhuma família termine por falta de amor\nQue o casal seja um para o outro de corpo e de mente\nE que nada no mundo separe um casal sonhador...',
          videoUrl: 'https://www.youtube.com/watch?v=M5G877FAn3k'
        }
      ];
      localStorage.setItem(SONGS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  saveSong: (song: ECCSong) => {
    const songs = storageService.getSongs();
    songs.push(song);
    localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
  },

  getApostolicRegions: (): ApostolicRegion[] => {
    const data = localStorage.getItem(REGIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveApostolicRegion: (region: ApostolicRegion) => {
    const regions = storageService.getApostolicRegions();
    const existingIndex = regions.findIndex(r => r.id === region.id);
    if (existingIndex >= 0) {
      regions[existingIndex] = region;
    } else {
      regions.push(region);
    }
    localStorage.setItem(REGIONS_KEY, JSON.stringify(regions));
  },

  getEvents: (): ECCEvent[] => {
    const data = localStorage.getItem(EVENTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveEvent: (event: ECCEvent) => {
    const events = storageService.getEvents();
    const existingIndex = events.findIndex(e => e.id === event.id);
    if (existingIndex >= 0) {
      events[existingIndex] = event;
    } else {
      events.push(event);
    }
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  },

  deleteEvent: (id: string) => {
    const events = storageService.getEvents().filter(e => e.id !== id);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  },

  subscribeToEvent: (eventId: string, userId: string) => {
    const events = storageService.getEvents();
    const event = events.find(e => e.id === eventId);
    if (event) {
      if (!event.attendees) event.attendees = [];
      if (!event.attendees.find(a => a.userId === userId)) {
        event.attendees.push({
          userId,
          status: 'PENDING',
          registrationDate: new Date().toISOString()
        });
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
      }
    }
  },

  unsubscribeFromEvent: (eventId: string, userId: string) => {
    const events = storageService.getEvents();
    const event = events.find(e => e.id === eventId);
    if (event && event.attendees) {
      event.attendees = event.attendees.filter(a => a.userId !== userId);
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    }
  },

  updateAttendeeStatus: (eventId: string, userId: string, status: 'APPROVED' | 'REJECTED', approverRole: string) => {
    const events = storageService.getEvents();
    const event = events.find(e => e.id === eventId);
    if (event && event.attendees) {
      const attendee = event.attendees.find(a => a.userId === userId);
      if (attendee) {
        attendee.status = status;
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events));

        // Notificar o usuário
        const notification: ECCNotification = {
          id: Math.random().toString(36).substr(2, 9),
          userId: userId,
          title: status === 'APPROVED' ? 'Inscrição Aprovada!' : 'Inscrição Não Homologada',
          message: `Sua participação no evento "${event.title}" foi ${status === 'APPROVED' ? 'aprovada' : 'rejeitada'} pela coordenação (${approverRole}).`,
          type: status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
          read: false,
          createdAt: new Date().toISOString()
        };
        storageService.addNotification(notification);
      }
    }
  },

  // Notificações
  getNotifications: (userId: string): ECCNotification[] => {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    const all: ECCNotification[] = data ? JSON.parse(data) : [];
    return all.filter(n => n.userId === userId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addNotification: (notification: ECCNotification) => {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    const all: ECCNotification[] = data ? JSON.parse(data) : [];
    all.push(notification);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
  },

  markAsRead: (id: string) => {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    if (data) {
      const all: ECCNotification[] = JSON.parse(data);
      const updated = all.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    }
  }
};
