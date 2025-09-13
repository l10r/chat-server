// User color generation based on sequence (like hack.chat)
const USER_COLORS = [
  '#4a9eff', // Blue
  '#00ff00', // Green  
  '#ff6b6b', // Red
  '#ffd93d', // Yellow
  '#6bcf7f', // Light Green
  '#4ecdc4', // Teal
  '#45b7d1', // Light Blue
  '#96ceb4', // Mint
  '#feca57', // Orange
  '#ff9ff3', // Pink
  '#54a0ff', // Sky Blue
  '#5f27cd', // Purple
  '#00d2d3', // Cyan
  '#ff9f43', // Orange Red
  '#10ac84', // Dark Green
  '#ee5a24', // Red Orange
  '#0984e3', // Blue
  '#6c5ce7', // Purple Blue
  '#a29bfe', // Light Purple
  '#fd79a8', // Pink Red
];

export function getUserColor(username: string, userList: string[]): string {
  // Get the index of the user in the user list (based on join order)
  const userIndex = userList.indexOf(username);
  
  // If user not found in list, use hash of username for consistent color
  if (userIndex === -1) {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
  }
  
  // Return color based on user's position in the list
  return USER_COLORS[userIndex % USER_COLORS.length];
}

export function getUsernameStyle(username: string, userList: string[]): React.CSSProperties {
  return {
    color: getUserColor(username, userList),
    fontWeight: 700,
  };
}
