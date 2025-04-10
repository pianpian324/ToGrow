import { auth, db } from '../config/firebase.js';

export async function loadCommunityPosts() {
    try {
        const postsRef = await db.collection('posts')
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        const postsContainer = document.querySelector('#community-posts');
        postsContainer.innerHTML = '';

        postsRef.forEach(doc => {
            const post = doc.data();
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-md p-4 mb-4';
            card.innerHTML = `
                <div class="flex items-center mb-4">
                    <img src="${post.authorAvatar || 'default-avatar.png'}" alt="${post.authorName}" class="w-10 h-10 rounded-full mr-4">
                    <div>
                        <h3 class="font-semibold">${post.authorName}</h3>
                        <span class="text-sm text-gray-500">${new Date(post.createdAt.toDate()).toLocaleDateString()}</span>
                    </div>
                </div>
                <p class="text-gray-700 mb-4">${post.content}</p>
                ${post.image ? `<img src="${post.image}" alt="帖子图片" class="w-full rounded-lg mb-4">` : ''}
                <div class="flex items-center space-x-4">
                    <button onclick="likePost('${doc.id}')" class="flex items-center text-gray-500 hover:text-blue-500">
                        <i class="fas fa-thumbs-up mr-2"></i>
                        <span>${post.likes || 0}</span>
                    </button>
                    <button onclick="showComments('${doc.id}')" class="flex items-center text-gray-500 hover:text-blue-500">
                        <i class="fas fa-comment mr-2"></i>
                        <span>${post.comments?.length || 0}</span>
                    </button>
                </div>
                <div id="comments-${doc.id}" class="hidden mt-4 space-y-2">
                    ${post.comments?.map(comment => `
                        <div class="bg-gray-50 p-2 rounded">
                            <div class="flex items-center">
                                <img src="${comment.authorAvatar || 'default-avatar.png'}" alt="${comment.authorName}" class="w-6 h-6 rounded-full mr-2">
                                <span class="font-medium">${comment.authorName}</span>
                            </div>
                            <p class="text-gray-700 text-sm mt-1">${comment.content}</p>
                        </div>
                    `).join('') || ''}
                    ${auth.currentUser ? `
                        <div class="flex mt-2">
                            <input type="text" id="comment-input-${doc.id}" placeholder="写下你的评论..." class="flex-1 border rounded-l px-2 py-1">
                            <button onclick="addComment('${doc.id}')" class="bg-blue-500 text-white px-4 py-1 rounded-r hover:bg-blue-600">发送</button>
                        </div>
                    ` : ''}
                </div>
            `;
            postsContainer.appendChild(card);
        });
    } catch (error) {
        console.error('加载社区帖子失败：', error);
        alert('加载社区帖子失败，请稍后重试');
    }
}

export async function createPost() {
    if (!auth.currentUser) {
        alert('请先登录');
        return;
    }

    const content = prompt('分享你的种植经验：');
    if (!content) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async () => {
        try {
            const file = fileInput.files[0];
            let imageUrl = '';

            if (file) {
                const storageRef = storage.ref(`posts/${auth.currentUser.uid}/${Date.now()}`);
                await storageRef.put(file);
                imageUrl = await storageRef.getDownloadURL();
            }

            await db.collection('posts').add({
                authorId: auth.currentUser.uid,
                authorName: auth.currentUser.displayName,
                authorAvatar: auth.currentUser.photoURL,
                content: content,
                image: imageUrl,
                likes: 0,
                comments: [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            loadCommunityPosts();
        } catch (error) {
            console.error('创建帖子失败：', error);
            alert('创建帖子失败，请稍后重试');
        }
    };
    fileInput.click();
}

export async function likePost(postId) {
    if (!auth.currentUser) {
        alert('请先登录');
        return;
    }

    try {
        const postRef = db.collection('posts').doc(postId);
        await postRef.update({
            likes: firebase.firestore.FieldValue.increment(1)
        });
        loadCommunityPosts();
    } catch (error) {
        console.error('点赞失败：', error);
        alert('点赞失败，请稍后重试');
    }
}

export async function addComment(postId) {
    if (!auth.currentUser) {
        alert('请先登录');
        return;
    }

    const input = document.querySelector(`#comment-input-${postId}`);
    const content = input.value.trim();
    if (!content) return;

    try {
        const postRef = db.collection('posts').doc(postId);
        await postRef.update({
            comments: firebase.firestore.FieldValue.arrayUnion({
                authorId: auth.currentUser.uid,
                authorName: auth.currentUser.displayName,
                authorAvatar: auth.currentUser.photoURL,
                content: content,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            })
        });

        input.value = '';
        loadCommunityPosts();
    } catch (error) {
        console.error('添加评论失败：', error);
        alert('添加评论失败，请稍后重试');
    }
}

export function showComments(postId) {
    const commentsDiv = document.querySelector(`#comments-${postId}`);
    commentsDiv.classList.toggle('hidden');
}
