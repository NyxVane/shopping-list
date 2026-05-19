import './style.css'

const input = document.querySelector('#itemInput');
const addButton = document.querySelector('#addButton');
const list = document.querySelector('#shoppingList');

// 1. BETÖLTÉS
const savedItems = JSON.parse(localStorage.getItem('myShoppingList')) || [];
savedItems.forEach(item => {
    const text = typeof item === 'string' ? item : item.text;
    const completed = typeof item === 'string' ? false : item.completed;
    list.appendChild(createListItem(text, completed));
});
sortList();

// 2. MENTÉS
function saveToLocalStorage() {
    const items = [];
    document.querySelectorAll('#shoppingList li').forEach(li => {
        const span = li.querySelector('span');
        if (span) {
            items.push({
                text: span.innerText,
                completed: span.classList.contains('completed')
            });
        }
    });
    localStorage.setItem('myShoppingList', JSON.stringify(items));
}

// 3. LISTAELEM LÉTREHOZÁSA
function createListItem(text, isCompleted = false) {
    const li = document.createElement('li');
    li.className = "list-item-anim flex justify-between items-center bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50 hover:border-zinc-600 transition-all group cursor-pointer select-none";

    const completedClass = isCompleted ? 'completed' : '';

    li.innerHTML = `
        <span class="font-medium flex-1 ${completedClass}">${text}</span>
        <div class="flex gap-2">
            <button class="edit-btn text-zinc-500 hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100 px-2 cursor-pointer">
                Szerk.
            </button>
            <button class="delete-btn text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 px-2 cursor-pointer">
                Törlés
            </button>
        </div>
    `;

    const span = li.querySelector('span');
    const deleteBtn = li.querySelector('.delete-btn');
    const editBtn = li.querySelector('.edit-btn');

    // Kihúzás
    li.addEventListener('click', (e) => {
        if (e.target !== deleteBtn && e.target !== editBtn && !li.querySelector('input')) {
            span.classList.toggle('completed');
            saveToLocalStorage();
            sortList();
        }
    });

    // Törlés
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        li.remove();
        saveToLocalStorage();
    });

    // Szerkesztés
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (li.querySelector('input')) return;

        const currentText = span.innerText;
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = currentText;
        editInput.className = "bg-zinc-700 border border-cyan-500 rounded px-2 py-1 text-white outline-none w-full";
        
        span.replaceWith(editInput);
        editInput.focus();

        const handleSave = () => {
            const newText = editInput.value.trim() || currentText;
            span.innerText = newText;
            editInput.replaceWith(span);
            saveToLocalStorage();
        };

        editInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') handleSave();
            if (event.key === 'Escape') editInput.replaceWith(span);
        });

        editInput.addEventListener('blur', handleSave);
    });

    return li;
}

// 4. ESEMÉNYKEZELŐK
addButton.addEventListener('click', () => {
    const value = input.value.trim();
    if (value) {
        list.appendChild(createListItem(value, false));
        saveToLocalStorage();
        sortList();
        input.value = '';
        input.focus();
    }
});

input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addButton.click();
});

const clearButton = document.querySelector('#clearAll');
if (clearButton) {
    clearButton.addEventListener('click', () => {
        if (confirm('Biztosan törölni akarod a teljes listát?')) {
            list.innerHTML = '';
            saveToLocalStorage();
        }
    });
}

function sortList() {
    const items = Array.from(list.children);
    
    // Sorbarendezzük: a nem-completed elemek kerüljenek előre
    items.sort((a, b) => {
        const aDone = a.querySelector('span').classList.contains('completed');
        const bDone = b.querySelector('span').classList.contains('completed');
        return aDone - bDone;
    });

    // Újra hozzáadjuk őket a listához (a DOM automatikusan áthelyezi őket)
    items.forEach(item => list.appendChild(item));
}