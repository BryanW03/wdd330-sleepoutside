export default class ProductComments {
  constructor(productId, outputSelector) {
    this.productId = productId;
    this.outputSelector = outputSelector;
    this.key = `comments-${this.productId}`;
  }

  init() {
    this.renderCommentSection();
    this.showComments();
    document
      .getElementById("submitComment")
      .addEventListener("click", this.addComment.bind(this));
  }

  getComments() {
    const comments = JSON.parse(localStorage.getItem(this.key));
    return Array.isArray(comments) ? comments : [];
  }

  addComment() {
    const commentInput = document.getElementById("commentText");
    const commentText = commentInput.value.trim();

    if (commentText === "") {
      return;
    }

    const comments = this.getComments();
    const newComment = {
      text: commentText,
      date: new Date().toLocaleDateString()
    };

    comments.push(newComment);
    localStorage.setItem(this.key, JSON.stringify(comments));
    commentInput.value = "";
    this.showComments();
  }

  showComments() {
    const comments = this.getComments();
    const listElement = document.getElementById("commentsList");
    listElement.innerHTML = "";

    if (comments.length === 0) {
      listElement.innerHTML = "<li>No comments yet. Be the first to leave one!</li>";
      return;
    }

    const htmlStrings = comments.map(
      (comment) => `<li>
        <p class="comment-text">${comment.text}</p>
        <span class="comment-date">${comment.date}</span>
      </li>`
    );
    listElement.innerHTML = htmlStrings.join("");
  }

  renderCommentSection() {
    const parentElement = document.querySelector(this.outputSelector);
    const html = `<section class="product-comments">
      <h3>Product Comments</h3>
      <div class="comment-form">
        <textarea id="commentText" placeholder="Write your comment here..." rows="3"></textarea>
        <button id="submitComment">Submit Comment</button>
      </div>
      <ul id="commentsList"></ul>
    </section>`;
    parentElement.insertAdjacentHTML("beforeend", html);
  }
}