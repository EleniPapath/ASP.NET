// ⚠️ ΣΗΜΑΝΤΙΚΟ: Αντικατέστησε τα παρακάτω με τα δικά σου στοιχεία
const OWNER = 'TO-USERNAME-SOU';   // π.χ. 'john-doe'
const REPO  = 'TO-REPO-SOU';       // π.χ. 'my-projects'

const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;

const folderListEl = document.getElementById('folder-list');
const contentArea  = document.getElementById('content-area');

async function fetchGitHub(path = '') {
    const response = await fetch(`${API_BASE}/${path}`);
    if (!response.ok) {
        throw new Error(`Σφάλμα API: ${response.status}`);
    }
    return response.json();
}

async function loadFolders() {
    try {
        const items = await fetchGitHub('');

        // Κρατάμε μόνο τους φακέλους (type === 'dir')
        const folders = items.filter(item => item.type === 'dir');

        if (folders.length === 0) {
            folderListEl.innerHTML = '<li>Δεν βρέθηκαν φάκελοι.</li>';
            return;
        }

        folderListEl.innerHTML = '';
        folders.forEach(folder => {
            const li = document.createElement('li');
            li.textContent = folder.name;
            li.addEventListener('click', () => loadHtmlFromFolder(folder.path));
            folderListEl.appendChild(li);
        });

    } catch (error) {
        folderListEl.innerHTML = `<li class="error">Σφάλμα: ${error.message}</li>`;
    }
}

async function loadHtmlFromFolder(folderPath) {
    contentArea.innerHTML = '<p>Φόρτωση...</p>';

    try {
        const items = await fetchGitHub(folderPath);

        // Ψάχνουμε για αρχείο .html (προτιμάμε το index.html αν υπάρχει)
        const htmlFile = items.find(item =>
            item.type === 'file' && item.name.toLowerCase() === 'index.html'
        ) || items.find(item =>
            item.type === 'file' && item.name.toLowerCase().endsWith('.html')
        );

        if (!htmlFile) {
            contentArea.innerHTML = '<p class="error">Δεν βρέθηκε αρχείο HTML σε αυτόν τον φάκελο.</p>';
            return;
        }

        // Δημιουργούμε το URL για το raw περιεχόμενο του HTML
        // Χρησιμοποιούμε το download_url ή κατασκευάζουμε το raw URL
        const rawUrl = htmlFile.download_url
            ? htmlFile.download_url
            : `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${htmlFile.path}`;

        // Εμφάνιση σε iframe
        contentArea.innerHTML = `
            <h2>${folderPath}</h2>
            <iframe src="${rawUrl}" title="${folderPath}"></iframe>
        `;

    } catch (error) {
        contentArea.innerHTML = `<p class="error">Σφάλμα: ${error.message}</p>`;
    }
}

// Εκκίνηση
loadFolders();
