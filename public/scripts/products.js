document.addEventListener('DOMContentLoaded', async function () {
    await loadProducts();
    document.getElementById('searchForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const manufacturer = document.getElementById('manufacturer').value;
        const expirationDateFrom = document.getElementById('expirationDateFrom').value;
        const expirationDateTo = document.getElementById('expirationDateTo').value;
        const minPrice = document.getElementById('minPrice').value;
        const maxPrice = document.getElementById('maxPrice').value;

        const url = new URL('/api/products', window.location.origin);
        const params = new URLSearchParams();

        if (name) params.append('name', name);
        if (manufacturer) params.append('manufacturer', manufacturer);
        if (expirationDateFrom) params.append('expirationDateFrom', expirationDateFrom);
        if (expirationDateTo) params.append('expirationDateTo', expirationDateTo);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);

        if (!params.toString()) {
            return loadProducts();
        }

        url.search = params.toString();

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.products && data.products.length > 0) {
                displayProducts(data.products);
            } else {
                document.getElementById('productList').innerHTML = '<p>Nema rezultata za pretragu.</p>';
            }
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    });
});

// funkcija za učitavanje svih proizvoda
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();

        if (data.products && data.products.length > 0) {
            displayProducts(data.products);
        } else {
            document.getElementById('productList').innerHTML = '<p>Nema proizvoda u bazi.</p>';
        }
    } catch (err) {
        console.error('Error fetching products:', err);
    }
}

function displayProducts(products) {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';

        productItem.innerHTML = `
            <h3>${product.name}</h3>
            <p><span>Proizvođač:</span> ${product.manufacturer}</p>
            <p><span>Opis:</span> ${product.description}</p>
            <p><span>Sastojci:</span> ${product.ingredients}</p>
            <p><span>Cijena:</span> ${product.price} KM</p>
            <p><span>Količina:</span> ${product.quantity}</p>
            <p><span>Rok trajanja:</span> ${new Date(product.expirationDate).toLocaleDateString('hr-HR')}</p>
        `;
        productList.appendChild(productItem);
    });
}