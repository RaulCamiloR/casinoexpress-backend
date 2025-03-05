export const parsear = (event)=>{
    if (typeof event.body === 'string') {
      try {
        return JSON.parse(event.body);
      } catch (error) {
        throw new Error('Invalid JSON');
      }
    }
    return event.body;
}