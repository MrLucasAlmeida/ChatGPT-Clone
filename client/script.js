import bot from './assets/bot.svg';
import user from './assets/user.svg';


const URL = 'https://backend.mrlucasalmeida.com:5001';
// const URL = 'https://localhost:5001';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

// display text to user character by character
function typeText(element, text) {
  let index = 0;
  const parentContainer = document.querySelector('#chat_container');
  let interval = setInterval(() => {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      parentContainer.scrollTop = parentContainer.scrollHeight;
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// generate unique id for each of the messages
function generateUniqueId() {
  const timeStamp =  Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timeStamp}-${hexadecimalString}`;
}

// chat stripe template that can be for both the AI messages and the user messages
function chatStripe(isAi, value, uniqueId) {
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img
            src=${isAi ? bot : user}
            alt="${isAi ? 'bot' : 'user'}"
          />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
    `
  )
}


const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  const uniqueId = generateUniqueId();

  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // scrolls all the way to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  // start the loading animation
  loader(messageDiv);

  // fetches AI response from server
  const response = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();


    typeText(messageDiv, parsedData);
  } else {
    // error message if something goes wrong
    const err = response.text();

    messageDiv.textContent = "Something went wrong.";
    alert(err);
  }
}


// event listeners for both enter and the submit icon
form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});