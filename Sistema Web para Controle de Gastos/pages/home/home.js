function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "../../index.html";
    }).catch(() => {
        alert('Erro ao fazer logout');
    });
}

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        fetchTransactions(user);
    }
});

function newTransaction() {
    window.location.href = "../transaction/transaction.html";
}

function fetchTransactions(user) {
    showLoading();
    transactionService.findByUser(user)
        .then(transactions => {
            hideLoading();
            allTransactions = transactions;
            populateYearFilter(allTransactions);

            loadFiltersFromStorage();

            updateBalanceAndList();
        })
        .catch(error => {
            hideLoading();
            console.error(error);
            alert('Erro ao recuperar transações');
        });
}

function updateBalanceAndList() {
    const selectedMonth = monthFilter.value;
    const selectedYear = yearFilter.value;

    localStorage.setItem('selectedMonth', selectedMonth);
    localStorage.setItem('selectedYear', selectedYear);

    const filtered = allTransactions.filter(tx => {
        const date = new Date(tx.date);
        const monthMatches = selectedMonth === 'all' || (date.getMonth() + 1) === Number(selectedMonth);
        const yearMatches = selectedYear === 'all' || date.getFullYear() === Number(selectedYear);
        return monthMatches && yearMatches;
    });

    updateBalance(filtered);
    renderTransactionList(filtered);
}

function updateBalance(transactions) {
    const currencyTotals = {};
    const currencyReceitas = {};
    const currencyDespesas = {};

    transactions.forEach(tx => {
        const curr = tx.money.currency || 'KZ';
        if (!(curr in currencyTotals)) {
            currencyTotals[curr] = 0;
            currencyReceitas[curr] = 0;
            currencyDespesas[curr] = 0;
        }
    });

    transactions.forEach(tx => {
        const curr = tx.money.currency || 'KZ';
        const value = Number(tx.money.value);
        if (tx.type === 'Receita') {
            currencyTotals[curr] += value;
            currencyReceitas[curr] += value;
        } else if (tx.type === 'Despesa') {
            currencyTotals[curr] -= value;
            currencyDespesas[curr] += value;
        }
    });

    balanceTotal.innerHTML = '';

    const geralContainer = document.createElement('div');
    geralContainer.classList.add('balance-container');

    const receitasBox = document.createElement('div');
    receitasBox.classList.add('balance-box', 'balance-receitas');
    const receitasTitle = document.createElement('h3');
    receitasTitle.textContent = 'Total Receitas';
    receitasBox.appendChild(receitasTitle);
    for (const [currency, value] of Object.entries(currencyReceitas)) {
        const span = document.createElement('span');
        span.textContent = formatCurrency(value, currency);
        receitasBox.appendChild(span);
    }
    geralContainer.appendChild(receitasBox);

    const despesasBox = document.createElement('div');
    despesasBox.classList.add('balance-box', 'balance-despesas');
    const despesasTitle = document.createElement('h3');
    despesasTitle.textContent = 'Total Despesas';
    despesasBox.appendChild(despesasTitle);
    for (const [currency, value] of Object.entries(currencyDespesas)) {
        const span = document.createElement('span');
        span.textContent = formatCurrency(value, currency);
        despesasBox.appendChild(span);
    }
    geralContainer.appendChild(despesasBox);

    balanceTotal.appendChild(geralContainer);

    const saldoContainer = document.createElement('div');
    saldoContainer.classList.add('saldo-geral-container');

    const saldoTitle = document.createElement('h3');
    saldoTitle.textContent = 'Saldo Actual';
    saldoContainer.appendChild(saldoTitle);

    for (const [currency, total] of Object.entries(currencyTotals)) {
        const span = document.createElement('span');
        span.textContent = formatCurrency(total, currency);
    
        if (total > 0) {
            span.classList.add('saldo-positivo');
        } else if (total < 0) {
            span.classList.add('saldo-negativo');
        } else {
            span.classList.add('saldo-zero');
        }
        
        saldoContainer.appendChild(span);
    }    

    

    balanceTotal.appendChild(saldoContainer);

}
function renderTransactionList(transactions) {
    const transactionList = document.getElementById('transactions');
    transactionList.innerHTML = '';

    transactions.forEach(tx => {
        const li = createTransactionListItem(tx);
        transactionList.appendChild(li);
    });
}

function createTransactionListItem(tx) {
    const li = document.createElement('li');
    li.classList.add('transaction-item', `transaction-${tx.type.toLowerCase()}`);
    li.id = tx.uid;

    li.addEventListener('click', () => {
        window.location.href = "../transaction/transaction.html?uid=" + tx.uid;
    });

    const row = document.createElement('div');
    row.classList.add('transaction-row');

    row.appendChild(createGroup('Data', formatDate(tx.date)));
    row.appendChild(createGroup('Tipo', tx.type));
    row.appendChild(createGroup('Categoria', tx.transactionType));
    row.appendChild(createGroup('Descrição', tx.description || '---'));
    row.appendChild(createGroup('Valor', formatMoney(tx.money)));

   
    const removeGroup = document.createElement('div');
    removeGroup.classList.add('transaction-group', 'transaction-remove-col');
    removeGroup.appendChild(createDeleteButton(tx));
    row.appendChild(removeGroup);

    li.appendChild(row);
    return li;
}


function createGroup(labelText, valueText) {
    const group = document.createElement('div');
    group.classList.add('transaction-group');

    const label = document.createElement('span');
    label.classList.add('transaction-label');
    label.textContent = labelText;

    const value = document.createElement('span');
    value.classList.add('transaction-value');
    value.textContent = valueText;

    group.appendChild(label);
    group.appendChild(value);

    return group;
}


function createParagraph(text, className) {
    const p = document.createElement('p');
    p.textContent = text;
    if (className) p.classList.add(className);
    return p;
}


function createDeleteButton(transaction) {
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = "Remover";
    deleteButton.classList.add('outline', 'danger');
    deleteButton.addEventListener('click', event => {
        event.stopPropagation();
        askRemoveTransaction(transaction);
    });
    return deleteButton;
}

function createParagraph(value) {
    const element = document.createElement('p');
    element.innerHTML = value;
    return element;
}

function askRemoveTransaction(transaction) {
    const shouldRemove = confirm('Deseja remover a transação?');
    if (shouldRemove) {
        removeTransaction(transaction);
    }
}

function removeTransaction(transaction) {
    showLoading();
    transactionService.remove(transaction)
        .then(() => {
            hideLoading();
            document.getElementById(transaction.uid).remove();
            allTransactions = allTransactions.filter(t => t.uid !== transaction.uid);
            updateBalanceAndList();
        })
        .catch(error => {
            hideLoading();
            console.log(error);
            alert('Erro ao remover transação');
        });
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR');
}

function formatMoney(money) {
    const currency = money.currency === 'AOA' ? 'KZ' : money.currency;
    return formatCurrency(money.value, currency);
}



function formatCurrency(value, currency) {
    let symbol = currency;

    if (currency === 'AOA') symbol = 'KZ';
    else if (currency === 'USD') symbol = '$';
    else if (currency === 'BRL') symbol = 'R$';
    else if (currency === 'EUR') symbol = '€';

    const [intPart, decimalPart] = Number(value).toFixed(2).split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${symbol} ${formattedInt},${decimalPart}`;
}


const monthFilter = document.getElementById('month-filter');
const yearFilter = document.getElementById('year-filter');
const balanceTotal = document.getElementById('balance-total');
let allTransactions = [];
let currentUser = null;

function populateMonthFilter() {
    monthFilter.innerHTML = '<option value="all">Todos os meses</option>';
    for (let i = 1; i <= 12; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = new Date(0, i - 1).toLocaleString('pt-BR', { month: 'long' });
        monthFilter.appendChild(option);
    }
}

function populateYearFilter(transactions) {
    populateMonthFilter();
    const years = new Set();
    transactions.forEach(tx => years.add(new Date(tx.date).getFullYear()));
    const sortedYears = Array.from(years).sort((a, b) => b - a);

    yearFilter.innerHTML = '<option value="all">Todos os anos</option>';
    sortedYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
}

function loadFiltersFromStorage() {
    const savedMonth = localStorage.getItem('selectedMonth');
    const savedYear = localStorage.getItem('selectedYear');

    if (savedMonth && Array.from(monthFilter.options).some(opt => opt.value === savedMonth)) {
        monthFilter.value = savedMonth;
    }

    if (savedYear && Array.from(yearFilter.options).some(opt => opt.value === savedYear)) {
        yearFilter.value = savedYear;
    }
}

monthFilter.addEventListener('change', updateBalanceAndList);
yearFilter.addEventListener('change', updateBalanceAndList);



document.getElementById('export-pdf-btn').addEventListener('click', () => {
    exportToPDF();
});

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const selectedMonth = monthFilter.value;
    const selectedYear = yearFilter.value;

    const filtered = allTransactions.filter(tx => {
        const date = new Date(tx.date);
        const monthMatches = selectedMonth === 'all' || (date.getMonth() + 1) === Number(selectedMonth);
        const yearMatches = selectedYear === 'all' || date.getFullYear() === Number(selectedYear);
        return monthMatches && yearMatches;
    });

    const rows = filtered.map(tx => [
        formatDate(tx.date),
        tx.type || '---',
        tx.transactionType || '---',
        tx.description || '---',
        formatMoney(tx.money)
    ]);

    // Cabeçalho
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Transações', 14, 16);

    // Filtros
    const labelPeriodo = `Período: ${selectedMonth === 'all' ? 'Todos os meses' : selectedMonth + '/' + selectedYear}`;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(labelPeriodo, 14, 22);

    doc.autoTable({
        startY: 28,
        head: [['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor']],
        body: rows,
        styles: { fontSize: 9, cellPadding: 2,},
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            halign: 'center',
        },
        
  
        columnStyles: {
    
            0: { cellWidth: 22, halign: 'center' },   
    
            1: { cellWidth: 35, halign: 'center' },   
    
            2: { cellWidth: 38, halign: 'center' },  
    
            3: { cellWidth: 55, halign: 'center' },   
    
            4: { cellWidth: 28, halign: 'right' },    

        },
        
        didDrawCell: data => {
            // Centraliza verticalmente o conteúdo das células
            const { cell } = data;
            if (cell.text && cell.text.length > 1) {
                cell.styles.valign = 'middle';
            }
        }
    });
    

    // Totais por moeda
    const currencyReceitas = {};
    const currencyDespesas = {};
    const currencySaldo = {};

    filtered.forEach(tx => {
        const curr = tx.money.currency || 'KZ';
        const value = Number(tx.money.value);

        if (!(curr in currencyReceitas)) {
            currencyReceitas[curr] = 0;
            currencyDespesas[curr] = 0;
            currencySaldo[curr] = 0;
        }

        if (tx.type === 'Receita') {
            currencyReceitas[curr] += value;
            currencySaldo[curr] += value;
        } else if (tx.type === 'Despesa') {
            currencyDespesas[curr] += value;
            currencySaldo[curr] -= value;
        }
    });

    // Adiciona totais abaixo da tabela
    let y = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo Financeiro:', 14, y);

    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    Object.keys(currencyReceitas).forEach(currency => {
        const receita = formatCurrency(currencyReceitas[currency], currency);
        const despesa = formatCurrency(currencyDespesas[currency], currency);
        const saldo = formatCurrency(currencySaldo[currency], currency);

        doc.text(`Moeda: ${currency}`, 14, y);
        y += 6;
        doc.text(`Total Receitas: ${receita}`, 20, y);
        y += 6;
        doc.text(`Total Despesas: ${despesa}`, 20, y);
        y += 6;
        doc.text(`Saldo Atual: ${saldo}`, 20, y);
        y += 10;
    });

    doc.save('transações.pdf');
}

