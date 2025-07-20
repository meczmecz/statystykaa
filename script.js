function showSection(sectionId) {
  const sections = document.querySelectorAll(".page-section");
  sections.forEach(section => {
    section.style.display = section.id === sectionId ? "block" : "none";
  });
}
