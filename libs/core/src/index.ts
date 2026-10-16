export interface UserProfile {
  id: string;
  name: string;
  role: 'admin' | 'agent' | 'manager';
  email: string;
}

export class EventBus {
  private static events = new Map<string, Function[]>();

  static on(event: string, fn: Function) {
    if (!this.events.has(event)) this.events.set(event, []);
    this.events.get(event)!.push(fn);
  }

  static emit(event: string, data: any) {
    this.events.get(event)?.forEach(fn => fn(data));
  }
}
