import { useEffect, useRef, useState } from 'react';
import { ShautClient } from '@shauter/shaut-client';
import { environment } from '../environments/environment';

export function App() {
  const loginButtonRef = useRef(null);
  const [text, setText] = useState('');

  const client = new ShautClient(environment.shautApi);

  const sendMessage = () => {
    client.shautMessage({
      text,
      origin: { lat: 0, long: 0 },
      radius: 2,
    });
  };

  useEffect(() => {
    function handleCredentialResponse(response: unknown) {
      console.log(response);
    }
    window.onload = function () {
      google.accounts.id.initialize({
        client_id:
          '1081610981131-hp3jnt74si95feee0ep2m4cl2dk8fskg.apps.googleusercontent.com',
        callback: handleCredentialResponse,
      });
      google.accounts.id.renderButton(
        loginButtonRef.current,
        { theme: 'outline', size: 'large' } // customization attributes
      );
    };
  }, []);

  return (
    <div>
      <div ref={loginButtonRef}></div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
      <button onClick={() => sendMessage()}>Send</button>
    </div>
  );
}

export default App;
