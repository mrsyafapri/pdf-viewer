const zoomButton = document.getElementById("zoom");
const input = document.getElementById("inputFile");
const openFile = document.getElementById("openPDF");
const currentPage = document.getElementById("current_page");
const viewer = document.querySelector(".pdf-viewer");
const search = document.getElementById("search");
let currentPDF = {};

// PWA
if ("serviceWorker" in navigator) {
	window.addEventListener("load", function () {
		navigator.serviceWorker
			.register("scripts/sw.js")
			.then(res => console.log("service worker registered"))
			.catch(err => console.log("service worker not registered", err))
	})
}

function resetCurrentPDF() {
	currentPDF = {
		file: null,
		countOfPages: 0,
		currentPage: 1,
		zoom: 1.5,
	};
}

search.addEventListener("search", () => {
	const searchValue = search.value;
	currentPDF.file.getPage(currentPDF.currentPage).then((page) => {
		page.getTextContent().then((textContent) => {
			const textItems = textContent.items;
			const text = textItems.map((item) => item.str).join(" ");
			const regex = new RegExp(searchValue, "gi");
			const matches = text.match(regex);
			if (matches) {
				alert(`Ditemukan ${matches.length} kemunculan kata '${searchValue}'`);
			} else {
				alert("Tidak ditemukan");
			}
		});
	});
});

openFile.addEventListener("click", () => {
	input.click();
});

input.addEventListener("change", (event) => {
	const inputFile = event.target.files[0];
	if (inputFile.type == "application/pdf") {
		const reader = new FileReader();
		reader.readAsDataURL(inputFile);
		reader.onload = () => {
			loadPDF(reader.result);
			zoomButton.disabled = false;
		};
	} else {
		alert("The file you are trying to open is not a pdf file!");
	}
});

zoomButton.addEventListener("input", () => {
	if (currentPDF.file) {
		document.getElementById("zoomValue").innerHTML = zoomButton.value + "%";
		currentPDF.zoom = parseInt(zoomButton.value) / 100;
		renderCurrentPage();
	}
});

document.getElementById("next").addEventListener("click", () => {
	const isValidPage = currentPDF.currentPage < currentPDF.countOfPages;
	if (isValidPage) {
		currentPDF.currentPage += 1;
		renderCurrentPage();
	}
});

document.getElementById("previous").addEventListener("click", () => {
	const isValidPage = currentPDF.currentPage - 1 > 0;
	if (isValidPage) {
		currentPDF.currentPage -= 1;
		renderCurrentPage();
	}
});

function loadPDF(data) {
	const pdfFile = pdfjsLib.getDocument(data);
	resetCurrentPDF();
	pdfFile.promise.then((doc) => {
		currentPDF.file = doc;
		currentPDF.countOfPages = doc.numPages;
		viewer.classList.remove("hidden");
		document.querySelector("main div#pdf-input").classList.add("hidden");
		renderCurrentPage();
	});
}

function renderCurrentPage() {
	currentPDF.file.getPage(currentPDF.currentPage).then((page) => {
		var context = viewer.getContext("2d");
		var viewport = page.getViewport({ scale: currentPDF.zoom });
		viewer.height = viewport.height;
		viewer.width = viewport.width;

		var renderContext = {
			canvasContext: context,
			viewport: viewport,
		};
		page.render(renderContext);
	});
	currentPage.innerHTML = currentPDF.currentPage + " of " + currentPDF.countOfPages;
}
