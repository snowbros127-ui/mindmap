import { CustomNode, CustomEdge } from '@/types/mindmap';

export interface RealtimeEvent {
  type: 'NODE_UPDATE' | 'CURSOR_MOVE' | 'USER_JOINED' | 'USER_LEFT';
  senderId: string;
  senderName: string;
  senderColor: string;
  payload: any;
  timestamp: number;
}

export class RealtimeSession {
  private channel: BroadcastChannel | null = null;
  private roomId: string;
  public userId: string;
  public userName: string;
  public userColor: string;
  private onEventCallback: ((event: RealtimeEvent) => void) | null = null;

  constructor(roomId: string, userName?: string) {
    this.roomId = roomId;
    this.userId = `user-${Math.floor(Math.random() * 8999 + 1000)}`;
    const studentNames = ['김철수 학생', '이영희 학생', '박지민 학생', '최민수 학생', '정수빈 학생', '강다은 학생'];
    this.userName = userName || studentNames[Math.floor(Math.random() * studentNames.length)];
    
    const colors = ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
    this.userColor = colors[Math.floor(Math.random() * colors.length)];

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(`mindcraft_room_${roomId}`);
      this.channel.onmessage = (msg) => {
        if (this.onEventCallback) {
          this.onEventCallback(msg.data);
        }
      };
    }
  }

  public subscribe(callback: (event: RealtimeEvent) => void) {
    this.onEventCallback = callback;
    this.broadcast({
      type: 'USER_JOINED',
      payload: {},
    });
  }

  public broadcast(eventData: { type: RealtimeEvent['type']; payload?: any }) {
    const fullEvent: RealtimeEvent = {
      type: eventData.type,
      payload: eventData.payload,
      senderId: this.userId,
      senderName: this.userName,
      senderColor: this.userColor,
      timestamp: Date.now(),
    };

    if (this.channel) {
      this.channel.postMessage(fullEvent);
    }
  }

  public leave() {
    this.broadcast({
      type: 'USER_LEFT',
      payload: {},
    });
    if (this.channel) {
      this.channel.close();
    }
  }
}
