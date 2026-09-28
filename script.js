const OWNER = 'EleniPapath';   // Το username σου στο GitHub
const REPO  = 'ASP.NET';       // Το όνομα του αποθετηρίου σου

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
    try {
        const items = await fetchGitHub(folderPath);

        // Ψάχνουμε για αρχείο .html (προτιμάμε το index.html αν υπάρχει)
        const htmlFile = items.find(item =>
            item.type === 'file' && item.name.toLowerCase() === 'index.html'
        ) || items.find(item =>
            item.type === 'file' && item.name.toLowerCase().endsWith('.html')
        );

        if (!htmlFile) {
            alert('Δεν βρέθηκε αρχείο HTML σε αυτόν τον φάκελο.');
            return;
        }

        // 🔥 ΔΗΜΙΟΥΡΓΙΑ ΤΟΥ ΣΩΣΤΟΥ URL (GitHub Pages αντί για raw GitHub)
        // Αυτό διασφαλίζει ότι το HTML θα φορτωθεί ως ιστοσελίδα και όχι ως κείμενο
        const pagesUrl = `https://${OWNER}.github.io/${REPO}/${htmlFile.path}`;

        // Άνοιγμα σε νέα καρτέλα (new tab)
        window.open(pagesUrl, '_blank');

    } catch (error) {
        console.error(error);
        alert('Σφάλμα: ' + error.message);
    }
}

// Εκκίνηση
loadFolders();
