import { useState } from 'react';
import { ShautClient } from '@shauter/shaut-client';
import { environment } from '../environments/environment';

export function App() {
  const [text, setText] = useState('');

  const client = new ShautClient(environment.shautApi);

  const sendMessage = () => {
    client.shautMessage({
      text,
      origin: { lat: 0, long: 0 },
      radius: 2,
    });
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
      <button onClick={() => sendMessage()}>Send</button>
    </div>
  );
}

export default App;
