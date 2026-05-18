export function generateMarkdownResume(data: {
  name: string;
  contact: string;

  overall_summary: string;

  skills: {
    [category: string]: string[];
  };

  experience?: {
    company: string;
    role: string;
    duration?: string;
    bullet_points: string[];
  }[];

  projects: {
    project_name: string;
    summary: string;
    bullet_points: { text: string }[];
    stack: string[];
  }[];

  education: {
    institution: string;
    degree: string;
    duration: string;
  }[];

  achievements?: string[];
}) {
  const {
    name,
    contact,
    overall_summary,
    skills,
    experience,
    projects,
    education,
    achievements,
  } = data;

  let md = `<p align="center"># ${name}\n</p>\n`;

  if (contact) {
    md += `<p align="center">${contact}</p>\n`;
  }

  md += `\n`;

  // SUMMARY
  md += `## Summary\n`;
  md += `${overall_summary}\n\n`;

  // EXPERIENCE
  if (experience && experience.length > 0) {
    md += `## Experience\n\n`;

    experience.forEach((exp) => {
      md += `### ${exp.company} | ${exp.role}`;

      if (exp.duration) {
        md += ` <span class="right">${exp.duration}</span>`;
      }

      md += `\n`;

      exp.bullet_points.forEach((bullet) => {
        md += `- ${bullet}\n`;
      });

      md += `\n`;
    });
  }

  // PROJECTS
  if (projects && projects.length > 0) {
    md += `## Projects\n\n`;

    projects.forEach((project) => {
      md += `### ${project.project_name}`;

      if (project.stack?.length > 0) {
        md += ` | ${project.stack.join(", ")}`;
      }

      md += `\n`;

      if (project.summary) {
        md += `${project.summary}\n\n`;
      }

      project.bullet_points.forEach((bullet) => {
        md += `- ${bullet.text}\n`;
      });

      md += `\n`;
    });
  }

  // SKILLS
  if (skills && Object.keys(skills).length > 0) {
    md += `## Technical Skills\n\n`;

    Object.entries(skills).forEach(([category, items]) => {
      const formattedCategory =
        category.charAt(0).toUpperCase() + category.slice(1);

      md += `- **${formattedCategory}:** ${items.join(", ")}\n`;
    });

    md += `\n`;
  }

  // ACHIEVEMENTS
  if (achievements && achievements.length > 0) {
    md += `## Achievements\n\n`;

    achievements.forEach((achievement) => {
      md += `- ${achievement}\n`;
    });

    md += `\n`;
  }

  // EDUCATION
  if (education && education.length > 0) {
    md += `## Education\n\n`;

    education.forEach((edu) => {
      md += `### ${edu.institution}`;

      if (edu.duration) {
        md += ` <span class="right">${edu.duration}</span>`;
      }

      md += `\n`;

      if (edu.degree) {
        md += `${edu.degree}\n`;
      }

      md += `\n`;
    });
  }

  return md.trim();
}
