// script.js — Lógica extraída de index.html
// Animação Matrix + Player de áudio

// --- LÓGICA DO EFEITO MATRIX ---
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

// Ajuste do canvas para tela cheia
function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Caracteres do Matrix (Katakana + Números)
const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const charArray = chars.split('');
const fontSize = 14;
let columns = canvas.width / fontSize;

// Array para controlar a posição Y de cada coluna
let drops = [];
function initDrops() {
	columns = canvas.width / fontSize;
	drops = [];
	for(let i = 0; i < columns; i++) {
		drops[i] = 1;
	}
}
initDrops();
window.addEventListener('resize', initDrops);

function drawMatrix() {
	// Fundo preto com opacidade baixa para criar o rastro
	ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = '#0F0'; // Cor verde Matrix
	ctx.font = fontSize + 'px monospace';

	for(let i = 0; i < drops.length; i++) {
		const text = charArray[Math.floor(Math.random() * charArray.length)];
		ctx.fillText(text, i * fontSize, drops[i] * fontSize);

		// Reseta a gota para o topo aleatoriamente ou se sair da tela
		if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
			drops[i] = 0;
		}
		drops[i]++;
	}
}
// Loop da animação Matrix
setInterval(drawMatrix, 33);


// --- LÓGICA DO AUDIO PLAYER ---
const audio = document.getElementById('audio-element');
const playBtn = document.getElementById('play-btn');
const playIcon = playBtn.querySelector('i');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volume-slider');
const forwardBtn = document.getElementById('forward-btn');
const backwardBtn = document.getElementById('backward-btn');

// Formatação de tempo (MM:SS)
function formatTime(seconds) {
	const min = Math.floor(seconds / 60);
	const sec = Math.floor(seconds % 60);
	return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

// Toggle Play/Pause
playBtn.addEventListener('click', () => {
	if (audio.paused) {
		audio.play().catch(e => console.log("Erro de reprodução (arquivo pode não existir localmente):", e));
		playIcon.classList.remove('fa-play');
		playIcon.classList.add('fa-pause');
		playIcon.classList.add('ml-0'); // Remove ajuste visual do ícone play
	} else {
		audio.pause();
		playIcon.classList.remove('fa-pause');
		playIcon.classList.add('fa-play');
		playIcon.classList.add('ml-1');
	}
});

// Atualizar barra de progresso
audio.addEventListener('timeupdate', () => {
	const progress = (audio.currentTime / audio.duration) * 100;
	progressBar.value = isNaN(progress) ? 0 : progress;
	currentTimeEl.textContent = formatTime(audio.currentTime);
});

// Setar duração quando metadados carregarem
audio.addEventListener('loadedmetadata', () => {
	durationEl.textContent = formatTime(audio.duration);
});

// Scrubbing (arrastar a barra)
progressBar.addEventListener('input', () => {
	const time = (progressBar.value / 100) * audio.duration;
	audio.currentTime = time;
});

// Volume
volumeSlider.addEventListener('input', (e) => {
	audio.volume = e.target.value;
});
// --- CONTROLE DE VELOCIDADE (ENGRENAGEM + MENU SUSPENSO) ---
const speedToggle = document.getElementById('speed-toggle');
const speedMenu = document.getElementById('speed-menu');
const speedOptions = document.querySelectorAll('.speed-option');

function openSpeedMenu() {
	speedMenu.classList.remove('hidden');
	speedToggle.setAttribute('aria-expanded', 'true');
}
function closeSpeedMenu() {
	speedMenu.classList.add('hidden');
	speedToggle.setAttribute('aria-expanded', 'false');
}

// Toggle do menu
speedToggle.addEventListener('click', (e) => {
	e.stopPropagation();
	if (speedMenu.classList.contains('hidden')) openSpeedMenu(); else closeSpeedMenu();
});

// Seleção de velocidade
function setSelectedSpeed(rate, clickedBtn) {
	audio.playbackRate = rate;
	speedOptions.forEach(b => b.classList.remove('bg-matrix-green', 'text-black'));
	if (clickedBtn) {
		clickedBtn.classList.add('bg-matrix-green', 'text-black');
	}
}

speedOptions.forEach(opt => {
	opt.addEventListener('click', (e) => {
		const rate = parseFloat(opt.dataset.speed);
		setSelectedSpeed(rate, opt);
		closeSpeedMenu();
	});
});

// Fechar ao clicar fora
document.addEventListener('click', (e) => {
	if (!speedMenu.classList.contains('hidden')) {
		// se clique fora do menu ou do toggle, fecha
		if (!speedMenu.contains(e.target) && e.target !== speedToggle) {
			closeSpeedMenu();
		}
	}
});

// Fechar com ESC
document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') closeSpeedMenu();
});

// Valor padrão
setSelectedSpeed(1, document.querySelector('.speed-option[data-speed="1"]'));

// Botões de Pular 15s
forwardBtn.addEventListener('click', () => {
	audio.currentTime += 15;
});
backwardBtn.addEventListener('click', () => {
	audio.currentTime -= 15;
});

// Tratamento de erro caso o arquivo não esteja na pasta src localmente
audio.addEventListener('error', (e) => {
	console.log("Arquivo de áudio não encontrado na pasta src. Certifique-se de que 'src/PODCAST-BOOTCAMP-IA-GENERATIVA.m4a' existe.");
});

