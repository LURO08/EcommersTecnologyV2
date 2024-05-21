import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase-config';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import Chart from 'chart.js/auto';

function TopProductsChart() {
    const [products, setProducts] = useState([]);
    const [showTopThreeOnly, setShowTopThreeOnly] = useState(false);
    const chartRef = useRef(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const productList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                // Ordena los productos por ventas en orden descendente
                productList.sort((a, b) => b.ventas - a.ventas);
                setProducts(productList);
            } catch (error) {
                console.error("Error fetching products: ", error);
            }
        };

        fetchProducts();

        const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
            const updatedProducts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            updatedProducts.sort((a, b) => b.ventas - a.ventas);
            setProducts(updatedProducts);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (chartRef.current !== null) {
            chartRef.current.destroy();
        }

        const filteredProducts = showTopThreeOnly ? products.slice(0, 3) : products;

        const ctx = document.getElementById('topProductsChart');
        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: filteredProducts.map(product => product.name),
                datasets: [{
                    label: 'Cantidad Vendida',
                    data: filteredProducts.map(product => product.ventas),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        return () => {
            if (chartRef.current !== null) {
                chartRef.current.destroy();
            }
        };
    }, [products, showTopThreeOnly]);

    const handleToggleTopThree = () => {
        setShowTopThreeOnly(prevState => !prevState);
    };

    return (
        <div>
            <h2>Productos más vendidos</h2>
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={showTopThreeOnly}
                        onChange={handleToggleTopThree}
                    />
                   3 Mas Vendidos
                </label>
            </div>
            <canvas id="topProductsChart"></canvas>
        </div>
    );
}

export default TopProductsChart;
