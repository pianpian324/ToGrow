import { auth, db, storage } from '../config/firebase.js';

export async function loadPlantGuides(currentTerm) {
    try {
        const plantsRef = await db.collection('plants')
            .where('suitableSeason', 'array-contains', currentTerm)
            .orderBy('difficulty')
            .limit(6)
            .get();

        const plantContainer = document.querySelector('#plant-guides');
        plantContainer.innerHTML = '';

        plantsRef.forEach(doc => {
            const plant = doc.data();
            const card = document.createElement('div');
            card.className = 'plant-card bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all';
            card.innerHTML = `
                <img src="${plant.image}" alt="${plant.name}" class="w-full h-48 object-cover rounded-lg mb-4">
                <h3 class="text-xl font-semibold mb-2">${plant.name}</h3>
                <p class="text-gray-600 mb-2">${plant.description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">难度：${'★'.repeat(plant.difficulty)}</span>
                    <button onclick="startPlanting('${doc.id}')" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">开始种植</button>
                </div>
            `;
            plantContainer.appendChild(card);
        });
    } catch (error) {
        console.error('加载植物指南失败：', error);
        alert('加载植物指南失败，请稍后重试');
    }
}

export async function loadPlantingDiaries() {
    if (!auth.currentUser) return;

    try {
        const plantingsRef = await db.collection('plantings')
            .where('userId', '==', auth.currentUser.uid)
            .orderBy('startDate', 'desc')
            .get();

        const diaryContainer = document.querySelector('#planting-diaries');
        diaryContainer.innerHTML = '';

        plantingsRef.forEach(doc => {
            const planting = doc.data();
            const card = document.createElement('div');
            card.className = 'diary-entry bg-white rounded-lg shadow-md p-4 mb-4';
            card.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">${planting.plantName}</h3>
                    <span class="text-sm text-gray-500">${new Date(planting.startDate.toDate()).toLocaleDateString()}</span>
                </div>
                <div class="space-y-4">
                    ${planting.logs.map(log => `
                        <div class="border-l-4 border-green-500 pl-4">
                            <div class="text-sm text-gray-500">${new Date(log.date.toDate()).toLocaleDateString()}</div>
                            <p class="text-gray-700">${log.content}</p>
                            ${log.image ? `<img src="${log.image}" alt="生长记录" class="mt-2 rounded-lg w-full">` : ''}
                        </div>
                    `).join('')}
                </div>
                ${!planting.completed ? `
                    <div class="mt-4 flex justify-between">
                        <button onclick="addGrowthLog('${doc.id}')" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">添加记录</button>
                        <button onclick="completePlanting('${doc.id}')" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">完成种植</button>
                    </div>
                ` : ''}
            `;
            diaryContainer.appendChild(card);
        });
    } catch (error) {
        console.error('加载种植日记失败：', error);
        alert('加载种植日记失败，请稍后重试');
    }
}

export async function startPlanting(plantId) {
    if (!auth.currentUser) {
        alert('请先登录');
        return;
    }

    try {
        const plantDoc = await db.collection('plants').doc(plantId).get();
        const plant = plantDoc.data();

        await db.collection('plantings').add({
            userId: auth.currentUser.uid,
            plantId: plantId,
            plantName: plant.name,
            startDate: firebase.firestore.FieldValue.serverTimestamp(),
            completed: false,
            logs: []
        });

        alert('开始种植成功！');
        loadPlantingDiaries();
    } catch (error) {
        console.error('开始种植失败：', error);
        alert('开始种植失败，请稍后重试');
    }
}

export async function addGrowthLog(plantingId) {
    const content = prompt('请输入生长记录：');
    if (!content) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async () => {
        try {
            const file = fileInput.files[0];
            let imageUrl = '';

            if (file) {
                const storageRef = storage.ref(`growth-logs/${auth.currentUser.uid}/${Date.now()}`);
                await storageRef.put(file);
                imageUrl = await storageRef.getDownloadURL();
            }

            const plantingRef = db.collection('plantings').doc(plantingId);
            await plantingRef.update({
                logs: firebase.firestore.FieldValue.arrayUnion({
                    date: firebase.firestore.FieldValue.serverTimestamp(),
                    content: content,
                    image: imageUrl
                })
            });

            loadPlantingDiaries();
        } catch (error) {
            console.error('添加生长记录失败：', error);
            alert('添加生长记录失败，请稍后重试');
        }
    };
    fileInput.click();
}

export async function completePlanting(plantingId) {
    try {
        await db.collection('plantings').doc(plantingId).update({
            completed: true,
            completionDate: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('恭喜完成种植！');
        loadPlantingDiaries();
    } catch (error) {
        console.error('完成种植失败：', error);
        alert('完成种植失败，请稍后重试');
    }
}
