import { User } from '@shared/schema';

interface ExportOptions {
  title?: string;
  styles?: string;
  includeStyles?: boolean;
  theme?: 'light' | 'dark';
}

interface ExportData {
  title: string;
  content: string;
  styles?: string;
}

export class HTMLExporter {
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private defaultStyles = `
    body {
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      color: #1a1a1a;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e5e5;
    }
    .profile-card {
      background: #f8f9fa;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .profile-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      gap: 16px;
    }
    .profile-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #dc2626;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
    }
    .profile-info h2 {
      margin: 0 0 8px 0;
      color: #1a1a1a;
    }
    .belt-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .belt-white { background: #f8f9fa; color: #1a1a1a; border: 1px solid #dee2e6; }
    .belt-blue { background: #3b82f6; color: white; }
    .belt-purple { background: #8b5cf6; color: white; }
    .belt-brown { background: #a16207; color: white; }
    .belt-black { background: #1a1a1a; color: white; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
      margin: 16px 0;
    }
    .stat-item {
      text-align: center;
      padding: 12px;
      background: white;
      border-radius: 6px;
      border: 1px solid #e5e5e5;
    }
    .stat-value {
      font-size: 20px;
      font-weight: bold;
      color: #dc2626;
      display: block;
    }
    .stat-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .bio-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e5e5;
    }
    .community-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }
    .export-date {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      color: #6b7280;
      font-size: 14px;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .table th, .table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e5e5;
    }
    .table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #374151;
    }
    @media (max-width: 768px) {
      body { padding: 10px; }
      .profile-header { flex-direction: column; text-align: center; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .community-grid { grid-template-columns: 1fr; }
    }
    /* Dark theme styles */
    .dark-theme {
      background-color: #0f0f0f;
      color: #e5e5e5;
    }
    .dark-theme .profile-card {
      background: #1a1a1a;
      border-color: #333;
    }
    .dark-theme .stat-item {
      background: #1a1a1a;
      border-color: #333;
    }
    .dark-theme .table th {
      background: #1a1a1a;
      color: #e5e5e5;
    }
  `;

  private getTemplate(data: ExportData, options: ExportOptions = {}) {
    const theme = options.theme === 'dark' ? 'dark-theme' : '';
    const styles = options.includeStyles !== false ? 
      (options.styles ? `${this.defaultStyles}\n${options.styles}` : this.defaultStyles) : 
      (options.styles || '');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(data.title)}</title>
    <style>${styles}</style>
</head>
<body class="${theme}">
    <div class="header">
        <h1>${this.escapeHtml(data.title)}</h1>
        <p>Exported from BJJ Social Platform</p>
    </div>
    
    ${data.content}
    
    <div class="export-date">
        <p>Exported on ${this.escapeHtml(new Date().toLocaleString())}</p>
    </div>
</body>
</html>`;
  }

  private downloadBlob(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  private formatUserProfile(user: User): string {
    const initials = `${(user.firstName || 'U').charAt(0)}${(user.lastName || 'U').charAt(0)}`.toUpperCase();
    const beltClass = `belt-${user.belt?.toLowerCase().replace(' ', '-') || 'white'}`;
    
    return `
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-avatar">
            ${user.profileImageUrl ? 
              `<img src="${this.escapeHtml(user.profileImageUrl)}" alt="${this.escapeHtml(user.firstName || 'Unknown')} ${this.escapeHtml(user.lastName || 'User')}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` : 
              this.escapeHtml(initials)
            }
          </div>
          <div class="profile-info">
            <h2>${this.escapeHtml(user.firstName || 'Unknown')} ${this.escapeHtml(user.lastName || 'User')}</h2>
            <span class="belt-badge ${beltClass}">${this.escapeHtml(user.belt || 'White')} Belt ${user.stripes ? `• ${user.stripes} Stripes` : ''}</span>
            <p style="margin: 4px 0; color: #6b7280;">${this.escapeHtml(user.location || 'Location not specified')}</p>
          </div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">${this.escapeHtml(user.yearsTraining || '0')}</span>
            <span class="stat-label">Years Training</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${user.competitions || 0}</span>
            <span class="stat-label">Competitions</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${user.wins || 0}</span>
            <span class="stat-label">Wins</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${user.losses || 0}</span>
            <span class="stat-label">Losses</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${user.followersCount || 0}</span>
            <span class="stat-label">Followers</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${user.postsCount || 0}</span>
            <span class="stat-label">Posts</span>
          </div>
        </div>
        
        ${user.bio ? `
          <div class="bio-section">
            <h3>About</h3>
            <p>${this.escapeHtml(user.bio)}</p>
          </div>
        ` : ''}
        
        ${user.school || user.instructor ? `
          <div class="bio-section">
            <h3>Training Details</h3>
            ${user.school ? `<p><strong>School:</strong> ${this.escapeHtml(user.school)}</p>` : ''}
            ${user.instructor ? `<p><strong>Instructor:</strong> ${this.escapeHtml(user.instructor)}</p>` : ''}
            ${user.weight ? `<p><strong>Weight:</strong> ${this.escapeHtml(user.weight)} (${this.escapeHtml(user.weightClass || 'N/A')})</p>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  // Export single user profile
  exportUserProfile(user: User, options: ExportOptions = {}) {
    const content = this.formatUserProfile(user);
    const data: ExportData = {
      title: `${user.firstName || 'Unknown'} ${user.lastName || 'User'} - BJJ Profile`,
      content
    };
    
    const html = this.getTemplate(data, options);
    const filename = `${(user.firstName || 'Unknown')}_${(user.lastName || 'User')}_profile.html`.replace(/\s+/g, '_');
    
    this.downloadBlob(html, filename);
  }

  // Export multiple user profiles
  exportCommunityProfiles(users: User[], options: ExportOptions = {}) {
    const content = `
      <div class="community-grid">
        ${users.map(user => this.formatUserProfile(user)).join('')}
      </div>
    `;
    
    const data: ExportData = {
      title: `BJJ Community - ${users.length} Profiles`,
      content
    };
    
    const html = this.getTemplate(data, options);
    const filename = `bjj_community_${users.length}_profiles.html`;
    
    this.downloadBlob(html, filename);
  }

  // Export data as table
  exportDataTable(tableData: { headers: string[], rows: string[][] }, title: string, options: ExportOptions = {}) {
    let tableHTML = '<table class="table">';
    
    // Headers
    if (tableData.headers.length > 0) {
      tableHTML += '<thead><tr>';
      tableData.headers.forEach(header => {
        tableHTML += `<th>${header}</th>`;
      });
      tableHTML += '</tr></thead>';
    }
    
    // Rows
    tableHTML += '<tbody>';
    tableData.rows.forEach(row => {
      tableHTML += '<tr>';
      row.forEach(cell => {
        tableHTML += `<td>${cell}</td>`;
      });
      tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';
    
    const data: ExportData = {
      title,
      content: tableHTML
    };
    
    const html = this.getTemplate(data, options);
    const filename = `${title.toLowerCase().replace(/\s+/g, '_')}.html`;
    
    this.downloadBlob(html, filename);
  }

  // Export custom HTML content
  exportCustomContent(title: string, htmlContent: string, options: ExportOptions = {}) {
    const data: ExportData = {
      title,
      content: htmlContent
    };
    
    const html = this.getTemplate(data, options);
    const filename = `${title.toLowerCase().replace(/\s+/g, '_')}.html`;
    
    this.downloadBlob(html, filename);
  }

  // Export DOM element
  exportDOMElement(elementId: string, title: string, options: ExportOptions = {}) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID "${elementId}" not found`);
      return;
    }
    
    const content = element.innerHTML;
    this.exportCustomContent(title, content, options);
  }

  // Export school leaderboard
  exportSchoolLeaderboard(
    schoolName: string, 
    leaderboardData: any[], 
    options: ExportOptions = {}
  ) {
    let tableHTML = `
      <div class="profile-card">
        <h2>${this.escapeHtml(schoolName)} Leaderboard</h2>
        <p class="stat-label">School Rankings by Division and Points</p>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>School Rank</th>
            <th>Global Rank</th>
            <th>Name</th>
            <th>Belt</th>
            <th>Division</th>
            <th>Points</th>
            <th>Wins</th>
            <th>Submissions</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    leaderboardData.forEach(entry => {
      const beltClass = `belt-${(entry.belt || 'white').toLowerCase().replace(' ', '-')}`;
      tableHTML += `
        <tr>
          <td><strong>#${entry.schoolRank}</strong></td>
          <td>#${entry.rank}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="profile-avatar" style="width: 32px; height: 32px; font-size: 12px;">
                ${entry.user.firstName?.charAt(0) || 'U'}${entry.user.lastName?.charAt(0) || 'U'}
              </div>
              ${this.escapeHtml(entry.user.firstName || 'Unknown')} ${this.escapeHtml(entry.user.lastName || 'User')}
            </div>
          </td>
          <td><span class="belt-badge ${beltClass}" style="font-size: 10px; padding: 2px 8px;">${this.escapeHtml(entry.belt || 'White')}</span></td>
          <td>${this.escapeHtml(entry.weightClass)} • ${this.escapeHtml(entry.gender)} • ${this.escapeHtml(entry.ageDivision)}</td>
          <td><strong>${entry.points}</strong></td>
          <td>${entry.wins}</td>
          <td>${entry.submissions}</td>
        </tr>
      `;
    });
    
    tableHTML += '</tbody></table>';
    
    const data: ExportData = {
      title: `${schoolName} - BJJ School Leaderboard`,
      content: tableHTML
    };
    
    const html = this.getTemplate(data, options);
    const filename = `${schoolName.toLowerCase().replace(/\s+/g, '_')}_school_leaderboard.html`;
    
    this.downloadBlob(html, filename);
  }

  // Export school rankings comparison
  exportSchoolRankings(schoolRankings: any[], options: ExportOptions = {}) {
    let tableHTML = `
      <div class="profile-card">
        <h2>BJJ School Rankings</h2>
        <p class="stat-label">Schools ranked by total points and performance</p>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>School Rank</th>
            <th>School Name</th>
            <th>Total Points</th>
            <th>Active Members</th>
            <th>Best Individual Rank</th>
            <th>Performance Score</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    schoolRankings.forEach(school => {
      const avgPoints = school.totalMembers > 0 ? Math.round(school.totalPoints / school.totalMembers) : 0;
      tableHTML += `
        <tr>
          <td><strong>#${school.schoolRank}</strong></td>
          <td><strong>${this.escapeHtml(school.school)}</strong></td>
          <td>${school.totalPoints.toLocaleString()}</td>
          <td>${school.totalMembers}</td>
          <td>${school.topRank > 0 ? `#${school.topRank}` : 'N/A'}</td>
          <td>${avgPoints} avg points</td>
        </tr>
      `;
    });
    
    tableHTML += '</tbody></table>';
    
    const data: ExportData = {
      title: 'BJJ School Rankings',
      content: tableHTML
    };
    
    const html = this.getTemplate(data, options);
    const filename = 'bjj_school_rankings.html';
    
    this.downloadBlob(html, filename);
  }

  // Export user's school position
  exportUserSchoolPosition(
    user: any, 
    schoolRanks: any[], 
    schoolLeaderboard: any[], 
    options: ExportOptions = {}
  ) {
    let content = this.formatUserProfile(user);
    
    if (schoolRanks.length > 0) {
      content += `
        <div class="profile-card">
          <h3>School Performance</h3>
          <div class="stats-grid">
      `;
      
      schoolRanks.forEach(rank => {
        content += `
          <div class="stat-item">
            <span class="stat-value">#${rank.schoolRank}</span>
            <span class="stat-label">School Rank</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${rank.totalMembers}</span>
            <span class="stat-label">School Members</span>
          </div>
        `;
      });
      
      content += '</div></div>';
    }
    
    if (schoolLeaderboard.length > 0) {
      content += `
        <div class="profile-card">
          <h3>School Teammates Rankings</h3>
          <table class="table">
            <thead>
              <tr>
                <th>School Rank</th>
                <th>Teammate</th>
                <th>Belt</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      schoolLeaderboard.slice(0, 10).forEach(entry => {
        const beltClass = `belt-${(entry.belt || 'white').toLowerCase().replace(' ', '-')}`;
        const isCurrentUser = entry.userId === user.id;
        const rowStyle = isCurrentUser ? 'background-color: #fef3c7; font-weight: bold;' : '';
        
        content += `
          <tr style="${rowStyle}">
            <td>#${entry.schoolRank}</td>
            <td>
              ${this.escapeHtml(entry.user.firstName || 'Unknown')} ${this.escapeHtml(entry.user.lastName || 'User')}
              ${isCurrentUser ? ' (You)' : ''}
            </td>
            <td><span class="belt-badge ${beltClass}" style="font-size: 10px; padding: 2px 8px;">${this.escapeHtml(entry.belt || 'White')}</span></td>
            <td>${entry.points}</td>
          </tr>
        `;
      });
      
      content += '</tbody></table></div>';
    }
    
    const data: ExportData = {
      title: `${user.firstName || 'Unknown'} ${user.lastName || 'User'} - School Performance`,
      content
    };
    
    const html = this.getTemplate(data, options);
    const filename = `${(user.firstName || 'Unknown')}_${(user.lastName || 'User')}_school_performance.html`.replace(/\s+/g, '_');
    
    this.downloadBlob(html, filename);
  }

  // Batch export with progress callback
  async batchExport(
    items: { data: any; title: string; type: 'profile' | 'custom' | 'school-leaderboard' | 'school-rankings' | 'school-position' }[], 
    options: ExportOptions = {},
    onProgress?: (current: number, total: number) => void
  ) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type === 'profile' && item.data) {
        this.exportUserProfile(item.data, options);
      } else if (item.type === 'custom') {
        this.exportCustomContent(item.title, item.data, options);
      } else if (item.type === 'school-leaderboard' && item.data) {
        this.exportSchoolLeaderboard(item.data.schoolName, item.data.leaderboard, options);
      } else if (item.type === 'school-rankings' && item.data) {
        this.exportSchoolRankings(item.data, options);
      } else if (item.type === 'school-position' && item.data) {
        this.exportUserSchoolPosition(item.data.user, item.data.schoolRanks, item.data.schoolLeaderboard, options);
      }
      
      if (onProgress) {
        onProgress(i + 1, items.length);
      }
      
      // Small delay to prevent browser from blocking downloads
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

// Create singleton instance
export const htmlExporter = new HTMLExporter();

// Export utility functions for convenience
export const exportUserProfile = (user: User, options?: ExportOptions) => 
  htmlExporter.exportUserProfile(user, options);

export const exportCommunityProfiles = (users: User[], options?: ExportOptions) => 
  htmlExporter.exportCommunityProfiles(users, options);

export const exportDataTable = (data: { headers: string[], rows: string[][] }, title: string, options?: ExportOptions) => 
  htmlExporter.exportDataTable(data, title, options);

export const exportCustomContent = (title: string, content: string, options?: ExportOptions) => 
  htmlExporter.exportCustomContent(title, content, options);

// School ranking export utility functions
export const exportSchoolLeaderboard = (schoolName: string, leaderboardData: any[], options?: ExportOptions) => 
  htmlExporter.exportSchoolLeaderboard(schoolName, leaderboardData, options);

export const exportSchoolRankings = (schoolRankings: any[], options?: ExportOptions) => 
  htmlExporter.exportSchoolRankings(schoolRankings, options);

export const exportUserSchoolPosition = (user: any, schoolRanks: any[], schoolLeaderboard: any[], options?: ExportOptions) => 
  htmlExporter.exportUserSchoolPosition(user, schoolRanks, schoolLeaderboard, options);