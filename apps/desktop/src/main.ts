const root = document.getElementById('root') as HTMLDivElement
const targetUrl = import.meta.env.VITE_SHELL_URL ?? 'http://localhost:3000'

root.innerHTML = 
  <div class="toolbar">
    <button id="refresh">刷新</button>
    <button id="open-browser">浏览器打开</button>
  </div>
  <iframe src=""></iframe>


const frame = root.querySelector('iframe') as HTMLIFrameElement
const refreshBtn = document.getElementById('refresh')
const openBtn = document.getElementById('open-browser')

refreshBtn?.addEventListener('click', () => {
  frame.src = frame.src
})

openBtn?.addEventListener('click', async () => {
  const { shell } = await import('@tauri-apps/api/shell')
  shell.open(targetUrl)
})
