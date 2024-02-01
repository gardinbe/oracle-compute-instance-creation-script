/**
 * Find the 'compute' iframe window within the document if it
 * isn't already the current window in devtools.
 */
const computeWindow = document.querySelector("#compute-wrapper")
	? window
	: document.querySelector("#sandbox-compute-container")?.contentWindow;
if (!computeWindow)
	throw new Error("Failed to find iframe window");

const createBtn = computeWindow.document.querySelector(".oui-savant__Panel--Footer .oui-button.oui-button-primary");
if (!createBtn || createBtn.textContent !== "Create")
	throw new Error("Failed to find 'Create' button");

const contentsElmt = computeWindow.document.querySelector(".oui-savant__Panel--Contents");
if (!contentsElmt)
	throw new Error("Failed to find contents element");

const headerElmt = computeWindow.document.querySelector(".oui-savant__Panel--Header");
if (!headerElmt)
	throw new Error("Failed to find header element");

/**
 * Create a new iframe to cloud.oracle.com, insert and hide it in
 * the 'compute' iframe's document, and then periodically refresh
 * it.
 * 
 * We need to periodically regenerate your session token as it
 * will probably expire too soon - this script might be running
 * for a long time!
 */
const sessionIframe = document.createElement("iframe");
sessionIframe.style.display = "none";
sessionIframe.src = "https://cloud.oracle.com";
computeWindow.document.body.append(sessionIframe);
const sessionWindow = sessionIframe.contentWindow;

//create the status bar
const statusElmt = computeWindow.document.createElement("div");
statusElmt.setAttribute("style", `
	z-index: 9999999999999;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 2rem;
	color: white;
	background-color: #00688c;
	box-shadow: 0px 0px 10px -4px black;
	white-space: break-spaces;
`);

/**
 * Set the status bar to be the same height as the header.
 */
const setStatusHeight = () => {
	statusElmt.style.height = `${headerElmt.clientHeight}px`;
};

setStatusHeight();
computeWindow.addEventListener("resize", setStatusHeight);
contentsElmt.prepend(statusElmt);

const logStyle = color => `background-color: #222; color: ${color}`;

console.clear();

console.info(
	"%c *** Started Oracle compute instance creation script *** ",
	logStyle("#e0b414")
);
console.info(
	`%c *** Filter logs with '***' to only show outputs from this script. *** `,
	logStyle("#f0dd99")
);
console.info(
	`%c *** It's advised to close devtools while the script is running, as over long periods of time it may crash (Oracle's fault). *** `,
	logStyle("#f0dd99")
);

const currentTime = () => {
	const now = new Date();
	const hours = now.getHours().toString().padStart(2, '0');
	const minutes = now.getMinutes().toString().padStart(2, '0');
	const seconds = now.getSeconds().toString().padStart(2, '0');
	return `${hours}:${minutes}:${seconds}`;
};

//you can change this on the fly if you want
let INTERVAL_DURATION = 30;

const countdownDuration = () => Math.round(INTERVAL_DURATION);

let countdown = countdownDuration();

/**
 * Interval to click the 'Create' button and reload the new tab
 * every `INTERVAL_DURATION` milliseconds.
 */
void setInterval(() => {
	if (countdown > 0) {
		statusElmt.style.backgroundColor = "#00688c";
		statusElmt.innerHTML = `Clicking again in <b>${countdown} seconds</b>`;
		countdown--;
		return;
	}

	sessionWindow.location.reload();
	createBtn.click();
	statusElmt.style.backgroundColor = "#44bd50";
	statusElmt.innerHTML = `Create clicked!`;
	console.log(
		`%c *** Clicked 'Create' at ${currentTime()} *** `,
		logStyle("#7cde6f")
	);
	countdown = countdownDuration();
}, 1000);