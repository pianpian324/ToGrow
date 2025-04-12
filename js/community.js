// Removed: import { auth, db, storage } from '../config/firebase.js'; // Assuming storage was also Firebase

// Placeholder for authentication status - replace with actual CIAM check
function isUserLoggedIn() {
    // In a real scenario, check CIAM session/token
    return localStorage.getItem('isLoggedIn') === 'true'; // Example placeholder
}
function getUserId() {
    // In a real scenario, get user ID from CIAM session/token
    return localStorage.getItem('userId'); // Example placeholder
}
function getUserName() {
    // In a real scenario, get user Name from CIAM session/token
    return localStorage.getItem('userName') || '匿名用户'; // Example placeholder
}
function getUserAvatar() {
    // In a real scenario, get user Avatar URL from CIAM session/token
    return localStorage.getItem('userAvatar') || 'default-avatar.png'; // Example placeholder
}

export async function loadCommunityPosts() {
    try {
        // GET /api/getPosts (or /api/posts)
        const response = await fetch('/api/getPosts'); // Adjust endpoint as needed
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const posts = await response.json(); // Assuming API returns array of posts

        const postsContainer = document.querySelector('#community-posts');
        postsContainer.innerHTML = ''; // Clear previous posts

        if (posts.length === 0) {
            postsContainer.innerHTML = '<p>社区还没有帖子。</p>';
            return;
        }

        posts.forEach(post => {
            // Assuming post object has: id, authorName, authorAvatar, content, image, likes, comments (array), createdAt (ISO string)
            const postDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '未知日期';
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-md p-4 mb-4';
            card.innerHTML = `
                <div class="flex items-center mb-4">
                    <img src="${post.authorAvatar || 'default-avatar.png'}" alt="${post.authorName}" class="w-10 h-10 rounded-full mr-4 object-cover">
                    <div>
                        <h3 class="font-semibold">${post.authorName || '匿名用户'}</h3>
                        <span class="text-sm text-gray-500">${postDate}</span>
                    </div>
                </div>
                <p class="text-gray-700 mb-4 whitespace-pre-wrap">${post.content}</p> <!-- Preserve line breaks -->
                ${post.image ? `<img src="${post.image}" alt="帖子图片" class="w-full rounded-lg mb-4 max-w-md">` : ''}
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                    <button onclick="likePost('${post.id}')" class="flex items-center hover:text-blue-500">
                        <i class="far fa-thumbs-up mr-1"></i> <!-- Using regular icon -->
                        <span>${post.likes || 0}</span>
                    </button>
                    <button onclick="showComments('${post.id}')" class="flex items-center hover:text-blue-500">
                        <i class="far fa-comment mr-1"></i> <!-- Using regular icon -->
                        <span>${post.comments?.length || 0}</span>
                    </button>
                </div>
                <div id="comments-${post.id}" class="hidden mt-4 space-y-2 border-t pt-4">
                    <h4 class="text-sm font-semibold mb-2">评论</h4>
                    ${post.comments?.map(comment => {
                        const commentDate = comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : '';
                        return `
                        <div class="bg-gray-50 p-2 rounded">
                            <div class="flex items-center text-xs mb-1">
                                <img src="${comment.authorAvatar || 'default-avatar.png'}" alt="${comment.authorName}" class="w-5 h-5 rounded-full mr-2 object-cover">
                                <span class="font-medium mr-2">${comment.authorName || '匿名用户'}</span>
                                <span class="text-gray-400">${commentDate}</span>
                            </div>
                            <p class="text-gray-700 text-sm">${comment.content}</p>
                        </div>`
                    }).join('') || '<p class="text-sm text-gray-400">暂无评论。</p>'}
                    ${isUserLoggedIn() ? `
                        <div class="flex mt-2">
                            <input type="text" id="comment-input-${post.id}" placeholder="写下你的评论..." class="flex-1 border rounded-l px-2 py-1 text-sm">
                            <button onclick="addComment('${post.id}')" class="bg-blue-500 text-white px-3 py-1 rounded-r hover:bg-blue-600 text-sm">发送</button>
                        </div>
                    ` : '<p class="text-sm text-gray-400 mt-2">请<a href="#" onclick="document.getElementById(\'login-modal\').style.display=\'flex\'" class="text-blue-500 hover:underline">登录</a>后发表评论。</p>'}
                </div>
            `;
            postsContainer.appendChild(card);
        });
    } catch (error) {
        console.error('加载社区帖子失败：', error);
        alert('加载社区帖子失败，请稍后重试');
        document.querySelector('#community-posts').innerHTML = '<p>加载帖子失败，请稍后重试。</p>';
    }
}

// "发布新贴" - Creates a new community post
export async function createPost() {
    // if (!auth.currentUser) { // Replaced
    if (!isUserLoggedIn()) {
        alert('请先登录');
        return;
    }
    const userId = getUserId();
    const userName = getUserName();
    const userAvatar = getUserAvatar();

    const content = prompt('分享你的种植经验：');
    if (!content || content.trim() === '') {
        alert("帖子内容不能为空！");
        return;
    }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async () => {
        const file = fileInput.files[0];
        let imageUrl = '';

        try {
             // **Image Upload Handling (Requires Backend Support)**
            if (file) {
                 alert("模拟图片上传。实际应用需要后端支持。");
                 // Example (needs actual implementation):
                 // const formData = new FormData();
                 // formData.append('image', file);
                 // const uploadResponse = await fetch('/api/uploadImage', { method: 'POST', body: formData /* Add Auth? */ });
                 // if (!uploadResponse.ok) throw new Error('Image upload failed');
                 // const uploadResult = await uploadResponse.json();
                 // imageUrl = uploadResult.imageUrl;
                 imageUrl = 'mock_post_image.jpg'; // Placeholder
            }

            // POST /api/createPost (or /api/posts)
            const response = await fetch('/api/createPost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', /* Auth headers */ },
                body: JSON.stringify({
                    authorId: userId, // Send user identifier
                    authorName: userName, // Send user display info
                    authorAvatar: userAvatar,
                    content: content.trim(),
                    image: imageUrl // Optional image URL
                    // likes, comments, createdAt set by backend
                })
            });

             if (!response.ok) {
                 const errorData = await response.text(); // Try to get error details
                 throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
             }

            alert('帖子发布成功！');
            loadCommunityPosts(); // Refresh posts
            // Optionally switch to community tab if not already there
            document.querySelector('[data-tab="community"]').click();

        } catch (error) {
            console.error('创建帖子失败：', error);
            alert(`创建帖子失败: ${error.message}`);
        }
    };
    // Trigger file input even if no image is selected initially
    // If user cancels, the rest of the function won't run
    // Consider asking user if they want to add image first
     if (confirm("是否要为帖子添加图片？")) {
        fileInput.click();
     } else {
        // Post without image
        // Need to duplicate the fetch logic here, or refactor
        // For simplicity, let's just alert and not proceed if they decline image
        // A better UI would separate text and image uploads
         alert("将发布无图帖子。");
         // Re-run fetch logic without image:
          try {
            const response = await fetch('/api/createPost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', /* Auth headers */ },
                body: JSON.stringify({
                    authorId: userId,
                    authorName: userName,
                    authorAvatar: userAvatar,
                    content: content.trim(),
                    image: '' // No image
                })
            });
             if (!response.ok) {
                 const errorData = await response.text();
                 throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
             }
            alert('帖子发布成功！');
            loadCommunityPosts();
            document.querySelector('[data-tab="community"]').click();
        } catch (error) {
            console.error('创建无图帖子失败：', error);
            alert(`创建帖子失败: ${error.message}`);
        }
     }
}

export async function likePost(postId) {
     if (!isUserLoggedIn()) {
        alert('请先登录点赞');
        return;
    }
    try {
        // POST /api/posts/{postId}/like
        const response = await fetch(`/api/posts/${postId}/like`, {
             method: 'POST', // Could also be PUT or PATCH
             headers: { /* Auth headers */ }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        // Optimistic UI update (optional but good UX)
        const likeButton = document.querySelector(`button[onclick="likePost('${postId}')"] span`);
        if (likeButton) {
             likeButton.textContent = parseInt(likeButton.textContent || '0') + 1;
        }
        // Or reload all posts: loadCommunityPosts(); (Simpler but less smooth)

    } catch (error) {
        console.error('点赞失败：', error);
        alert('点赞失败，请稍后重试');
    }
}

export async function addComment(postId) {
     if (!isUserLoggedIn()) {
        alert('请先登录评论');
        return;
    }
    const userId = getUserId();
    const userName = getUserName();
    const userAvatar = getUserAvatar();


    const input = document.querySelector(`#comment-input-${postId}`);
    const content = input.value.trim();
    if (!content) return;

    try {
        // POST /api/posts/{postId}/comments
         const response = await fetch(`/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', /* Auth headers */ },
            body: JSON.stringify({
                authorId: userId,
                authorName: userName,
                authorAvatar: userAvatar,
                content: content
                 // createdAt set by backend
            })
        });
         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        input.value = ''; // Clear input field
        // Reload posts to show the new comment
        // A more advanced version could just append the new comment to the DOM
        loadCommunityPosts();

    } catch (error) {
        console.error('添加评论失败：', error);
        alert('添加评论失败，请稍后重试');
    }
}

// No backend call needed, just toggles visibility
export function showComments(postId) {
    const commentsDiv = document.querySelector(`#comments-${postId}`);
    commentsDiv.classList.toggle('hidden');
}
