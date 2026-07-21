const chatContainer = document.getElementById("chatContainer");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const statusText = document.getElementById("status");
const conversationList = document.getElementById("conversationList");
const modelSelect = document.getElementById("modelSelect");
const noticeText = document.getElementById("noticeText");
const micBtn = document.getElementById("micBtn");

const welcomeCards = [
  [
    "⌁",
    "Search the web",
    "Find the latest AI agent news",
    "Search the web for latest AI agent news.",
  ],
  [
    "▤",
    "Understand a document",
    "Summarize an uploaded file",
    "Summarize the document I uploaded.",
  ],
  [
    "✦",
    "Save to memory",
    "Keep a useful detail for later",
  ],
  ["÷", "Work it out", "Use the calculator tool", "Calculate 125 * 48 / 6"],
];

let threadId = localStorage.getItem("thread_id") || crypto.randomUUID();
localStorage.setItem("thread_id", threadId);
let recognition = null;
let isDictating = false;

if (localStorage.getItem("selected_model"))
  modelSelect.value = localStorage.getItem("selected_model");
modelSelect.addEventListener("change", () => {
  localStorage.setItem("selected_model", modelSelect.value);
  noticeText.textContent = `Selected model: ${modelSelect.options[modelSelect.selectedIndex].text}`;
});

function renderWelcome() {
  chatContainer.innerHTML = `<div id="welcome" class="mx-auto max-w-3xl pt-12 text-center sm:pt-20"><div class="mx-auto mb-7 grid h-16 w-16 place-items-center rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/25 to-white/5 text-3xl text-gold shadow-gold">✦</div><p class="mb-3 text-[11px] font-semibold uppercase tracking-[.28em] text-gold">Your thinking partner</p><h2 class="font-serif text-4xl font-semibold leading-tight tracking-tight text-cream sm:text-5xl">What shall we <span class="bg-gradient-to-r from-gold via-[#fff1cb] to-gold bg-clip-text text-transparent">explore</span> today?</h2><p class="mx-auto mt-5 max-w-xl text-sm leading-7 text-mist sm:text-base">A focused space for research, documents, calculations, and the details you want FakeGPT to remember.</p></div><div id="cards" class="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2"></div>`;
  document.getElementById("cards").innerHTML = welcomeCards
    .map(
      ([icon, title, copy, prompt]) =>
        `<button onclick="usePrompt(${JSON.stringify(prompt)})" class="group rounded-2xl border border-white/10 bg-white/[.035] p-4 text-left transition hover:-translate-y-0.5 hover:border-gold/35 hover:bg-gold/[.07] hover:shadow-glow"><span class="mb-4 grid h-9 w-9 place-items-center rounded-lg bg-gold/10 text-lg text-gold">${icon}</span><span class="block text-sm font-semibold text-cream">${title}</span><span class="mt-1 block text-xs text-mist/70">${copy}</span></button>`,
    )
    .join("");
}

function hideWelcome() {
  document.getElementById("welcome")?.remove();
  document.getElementById("cards")?.remove();
}
function autoResize(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}
function handleKeyDown(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}
function usePrompt(text) {
  messageInput.value = text;
  autoResize(messageInput);
  messageInput.focus();
}
function openFilePicker() {
  document.getElementById("fileInput").click();
}

function addMessage(role, content = "") {
  hideWelcome();
  const isUser = role === "user";
  const messageDiv = document.createElement("div");
  messageDiv.className = `mx-auto mb-7 flex max-w-3xl gap-3 ${isUser ? "justify-end" : "justify-start"}`;
  messageDiv.innerHTML = `${!isUser ? '<div class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold to-[#b98031] font-serif text-xs font-bold text-ink shadow-gold">✦</div>' : ""}<div data-message-content class="max-w-[82%] whitespace-pre-wrap break-words text-sm leading-7 sm:text-[15px] ${isUser ? "rounded-2xl rounded-br-sm border border-gold/20 bg-gold/10 px-4 py-3 text-[#fff5df]" : "pt-1 text-cream/90"}"></div>${isUser ? '<div class="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-xs font-semibold text-cream">YOU</div>' : ""}`;
  const messageContent = messageDiv.querySelector("[data-message-content]");
  messageContent.textContent = content;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return messageContent;
}

function detectLikelyTool(message) {
  const text = message.toLowerCase();
  if (/remember that|save this|store this|keep in memory|memorize/.test(text))
    return "Memory Save";
  if (/what do you remember|recall|my memory|remember about me/.test(text))
    return "Memory Recall";
  if (
    /document|pdf|file|uploaded|summarize|summary|according to|based on/.test(
      text,
    )
  )
    return "Document Search";
  if (
    /latest|current|today|now|recent|news|search web|web search|internet|online|price|version|update|2025|2026|who is|what is happening|trending|release|new model|current ceo|latest version/.test(
      text,
    )
  )
    return "Web Search";
  if (/(\d+\s*[\+\-\*\/]\s*\d+)|calculate|calculation|math|solve/.test(text))
    return "Calculator";
  return null;
}

function addToolProgress(toolName) {
  const wrapper = document.createElement("div");
  wrapper.className = "mx-auto -mt-3 mb-5 flex max-w-3xl";
  wrapper.innerHTML = `<div class="flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1.5 text-xs text-gold"><span class="h-3 w-3 animate-spin rounded-full border-2 border-gold/25 border-t-gold"></span><span>Using ${toolName}…</span></div>`;
  chatContainer.appendChild(wrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return {
    wrapper,
    icon: wrapper.querySelector("span"),
    text: wrapper.querySelector("span:last-child"),
  };
}
function completeToolProgress(progress, toolName) {
  if (progress) {
    progress.icon.className = "text-emerald-300";
    progress.icon.textContent = "✓";
    progress.text.textContent = `${toolName} completed`;
  }
}

async function loadConversations() {
  try {
    const data = await (await fetch("/conversations")).json();
    conversationList.innerHTML = "";
    if (!data.conversations?.length) {
      conversationList.innerHTML =
        '<p class="px-3 py-2 text-xs text-mist/45">No chats yet</p>';
      return;
    }
    data.conversations.forEach((conv) => {
      const item = document.createElement("button");
      item.className = `block w-full truncate rounded-lg px-3 py-2.5 text-left text-sm transition ${conv.thread_id === threadId ? "bg-gold/15 text-cream" : "text-mist/70 hover:bg-white/5 hover:text-cream"}`;
      item.textContent = conv.title || "New chat";
      item.onclick = () => loadConversation(conv.thread_id);
      conversationList.appendChild(item);
    });
  } catch (error) {
    console.error("Failed to load conversations:", error);
  }
}

async function loadConversation(selectedThreadId) {
  threadId = selectedThreadId;
  localStorage.setItem("thread_id", threadId);
  try {
    const data = await (await fetch(`/history/${threadId}`)).json();
    chatContainer.innerHTML = "";
    if (!data.messages?.length) renderWelcome();
    else
      data.messages.forEach((msg) =>
        addMessage(msg.role === "user" ? "user" : "assistant", msg.content),
      );
    await loadConversations();
  } catch (error) {
    console.error("Failed to load conversation:", error);
  }
}

function parseSSEPart(part) {
  const lines = part
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("data:"));
  if (!lines.length) return null;
  const text = lines
    .map((line) => line.replace(/^data:\s*/, ""))
    .join("\n")
    .trim();
  if (!text || text === "[DONE]") return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;
  if (isDictating) stopDictation();
  const selectedModel = modelSelect.value;
  addMessage("user", message);
  messageInput.value = "";
  messageInput.style.height = "auto";
  sendBtn.disabled = true;
  statusText.textContent = "Thinking…";
  const likelyTool = detectLikelyTool(message);
  const toolProgress = likelyTool && addToolProgress(likelyTool);
  if (likelyTool) statusText.textContent = `Using ${likelyTool}…`;
  const botElement = addMessage("assistant");
  let firstToken = false;
  const handleData = (data) => {
    if (!data) return;
    if (data.token != null) {
      if (!firstToken) {
        firstToken = true;
        completeToolProgress(toolProgress, likelyTool);
        statusText.textContent = "Generating…";
      }
      botElement.textContent += data.token;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    if (data.error) {
      completeToolProgress(toolProgress, likelyTool);
      botElement.textContent += `\n\nError: ${data.error}`;
    }
    if (data.done) statusText.textContent = "Ready";
  };
  try {
    const response = await fetch("/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        thread_id: threadId,
        model: selectedModel,
      }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      botElement.textContent =
        error.detail || error.message || "Request failed.";
      return;
    }
    if (!response.body) {
      botElement.textContent = "Streaming is not supported by this browser.";
      return;
    }
    const reader = response.body.getReader(),
      decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split(/\r?\n\r?\n/);
      buffer = parts.pop() || "";
      parts.forEach((part) => handleData(parseSSEPart(part)));
    }
    buffer += decoder.decode();
    if (buffer.trim()) handleData(parseSSEPart(buffer));
  } catch (error) {
    completeToolProgress(toolProgress, likelyTool);
    botElement.textContent = `Something went wrong: ${error.message}`;
  } finally {
    completeToolProgress(toolProgress, likelyTool);
    sendBtn.disabled = false;
    statusText.textContent = "Ready";
    messageInput.focus();
    await loadConversations();
  }
}

async function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files.length) return;
  const file = fileInput.files[0];
  addMessage("user", `📎 Uploaded document: ${file.name}`);
  const progress = addToolProgress("Document Ingestion");
  statusText.textContent = "Uploading…";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("thread_id", threadId);
  try {
    const data = await (
      await fetch("/upload", { method: "POST", body: formData })
    ).json();
    completeToolProgress(progress, "Document Ingestion");
    addMessage(
      "assistant",
      data.success
        ? `${data.message}\n\nYou can now ask questions about this document.`
        : `Upload failed: ${data.message}`,
    );
    if (data.success) await loadConversations();
  } catch (error) {
    completeToolProgress(progress, "Document Ingestion");
    addMessage("assistant", `Upload failed: ${error.message}`);
  } finally {
    statusText.textContent = "Ready";
    fileInput.value = "";
  }
}

function setupSpeechRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  const speech = new SpeechRecognition();
  speech.lang = "en-US";
  speech.continuous = true;
  speech.interimResults = true;
  speech.onstart = () => {
    isDictating = true;
    micBtn.classList.add("bg-red-500/80", "text-white", "animate-pulse");
    statusText.textContent = "Listening…";
  };
  speech.onresult = (event) => {
    let final = "",
      interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++)
      event.results[i].isFinal
        ? (final += `${event.results[i][0].transcript} `)
        : (interim += event.results[i][0].transcript);
    if (final) {
      messageInput.value =
        `${messageInput.value.trim()} ${final.trim()}`.trim();
      autoResize(messageInput);
    }
    if (interim) noticeText.textContent = `Listening: ${interim}`;
  };
  speech.onerror = (event) => {
    if (event.error === "not-allowed")
      alert("Microphone permission denied. Please allow microphone access.");
    stopDictation();
  };
  speech.onend = () => {
    if (isDictating)
      try {
        speech.start();
      } catch {
        stopDictation();
      }
  };
  return speech;
}
function toggleDictation() {
  if (!recognition) recognition = setupSpeechRecognition();
  if (!recognition) {
    alert(
      "Speech recognition is not supported in this browser. Please use Chrome or Edge.",
    );
    return;
  }
  isDictating ? stopDictation() : recognition.start();
}
function stopDictation() {
  isDictating = false;
  try {
    recognition?.stop();
  } catch {}
  micBtn.classList.remove("bg-red-500/80", "text-white", "animate-pulse");
  statusText.textContent = "Ready";
  noticeText.textContent =
    "FakeGPT can make mistakes. Check important information.";
  messageInput.focus();
}
async function newChat() {
  threadId = crypto.randomUUID();
  localStorage.setItem("thread_id", threadId);
  if (isDictating) stopDictation();
  renderWelcome();
  await loadConversations();
  messageInput.focus();
}

renderWelcome();
loadConversations();
if (threadId) loadConversation(threadId);
