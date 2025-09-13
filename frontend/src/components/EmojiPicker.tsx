import React from 'react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  isVisible: boolean;
  onToggle: () => void;
}

const emojiDatabase = {
  // Faces & Emotions
  "grinning-face": "Grinning Face",
  "grinning-face-with-smiling-eyes": "Grinning Face With Smiling Eyes",
  "face-with-tears-of-joy": "Face With Tears of Joy",
  "rolling-on-the-floor-laughing": "Rolling On The Floor Laughing",
  "smiling-face-with-open-mouth": "Smiling Face With Open Mouth",
  "smiling-face-with-open-mouth-and-smiling-eyes": "Smiling Face With Open Mouth and Smiling Eyes",
  "smiling-face-with-open-mouth-and-cold-sweat": "Smiling Face With Open Mouth and Cold Sweat",
  "smiling-face-with-open-mouth-and-tightly-closed-eyes": "Smiling Face With Open Mouth and Tightly-Closed Eyes",
  "winking-face": "Winking Face",
  "smiling-face-with-smiling-eyes": "Smiling Face With Smiling Eyes",
  "face-savouring-delicious-food": "Face Savouring Delicious Food",
  "smiling-face-with-sunglasses": "Smiling Face With Sunglasses",
  "smiling-face-with-heart-shaped-eyes": "Smiling Face With Heart-Shaped Eyes",
  "face-throwing-a-kiss": "Face Throwing a Kiss",
  "kissing-face": "Kissing Face",
  "kissing-face-with-smiling-eyes": "Kissing Face With Smiling Eyes",
  "kissing-face-with-closed-eyes": "Kissing Face With Closed Eyes",
  "white-smiling-face": "White Smiling Face",
  "slightly-smiling-face": "Slightly Smiling Face",
  "hugging-face": "Hugging Face",
  "thinking-face": "Thinking Face",
  "neutral-face": "Neutral Face",
  "expressionless-face": "Expressionless Face",
  "face-without-mouth": "Face Without Mouth",
  "face-with-rolling-eyes": "Face With Rolling Eyes",
  "smirking-face": "Smirking Face",
  "persevering-face": "Persevering Face",
  "disappointed-but-relieved-face": "Disappointed but Relieved Face",
  "face-with-open-mouth": "Face With Open Mouth",
  "zipper-mouth-face": "Zipper-Mouth Face",
  "hushed-face": "Hushed Face",
  "sleepy-face": "Sleepy Face",
  "tired-face": "Tired Face",
  "sleeping-face": "Sleeping Face",
  "relieved-face": "Relieved Face",
  "nerd-face": "Nerd Face",
  "face-with-stuck-out-tongue": "Face With Stuck-Out Tongue",
  "face-with-stuck-out-tongue-and-winking-eye": "Face With Stuck-Out Tongue and Winking Eye",
  "face-with-stuck-out-tongue-and-tightly-closed-eyes": "Face With Stuck-Out Tongue and Tightly-Closed Eyes",
  "drooling-face": "Drooling Face",
  "unamused-face": "Unamused Face",
  "face-with-cold-sweat": "Face With Cold Sweat",
  "pensive-face": "Pensive Face",
  "confused-face": "Confused Face",
  "upside-down-face": "Upside-Down Face",
  "money-mouth-face": "Money-Mouth Face",
  "astonished-face": "Astonished Face",
  "white-frowning-face": "White Frowning Face",
  "slightly-frowning-face": "Slightly Frowning Face",
  "confounded-face": "Confounded Face",
  "disappointed-face": "Disappointed Face",
  "worried-face": "Worried Face",
  "face-with-look-of-triumph": "Face With Look of Triumph",
  "crying-face": "Crying Face",
  "loudly-crying-face": "Loudly Crying Face",
  "frowning-face-with-open-mouth": "Frowning Face With Open Mouth",
  "anguished-face": "Anguished Face",
  "fearful-face": "Fearful Face",
  "weary-face": "Weary Face",
  "grimacing-face": "Grimacing Face",
  "face-with-open-mouth-and-cold-sweat": "Face With Open Mouth and Cold Sweat",
  "face-screaming-in-fear": "Face Screaming in Fear",
  "flushed-face": "Flushed Face",
  "dizzy-face": "Dizzy Face",
  "pouting-face": "Pouting Face",
  "angry-face": "Angry Face",
  "smiling-face-with-halo": "Smiling Face With Halo",
  "face-with-cowboy-hat": "Face With Cowboy Hat",
  "clown-face": "Clown Face",
  "lying-face": "Lying Face",
  "face-with-medical-mask": "Face With Medical Mask",
  "face-with-thermometer": "Face With Thermometer",
  "face-with-head-bandage": "Face With Head-Bandage",
  "nauseated-face": "Nauseated Face",
  "sneezing-face": "Sneezing Face",
  "smiling-face-with-horns": "Smiling Face With Horns",
  
  // Fantasy & Mythical
  "imp": "Imp",
  "japanese-ogre": "Japanese Ogre",
  "japanese-goblin": "Japanese Goblin",
  "skull": "Skull",
  "skull-and-crossbones": "Skull and Crossbones",
  "ghost": "Ghost",
  "extraterrestrial-alien": "Extraterrestrial Alien",
  "alien-monster": "Alien Monster",
  "robot-face": "Robot Face",
  
  // Animals & Nature
  "pile-of-poo": "Pile of Poo",
  "smiling-cat-face-with-open-mouth": "Smiling Cat Face With Open Mouth",
  "grinning-cat-face-with-smiling-eyes": "Grinning Cat Face With Smiling Eyes",
  "cat-face-with-tears-of-joy": "Cat Face With Tears of Joy",
  "smiling-cat-face-with-heart-shaped-eyes": "Smiling Cat Face With Heart-Shaped Eyes",
  "cat-face-with-wry-smile": "Cat Face With Wry Smile",
  "kissing-cat-face-with-closed-eyes": "Kissing Cat Face With Closed Eyes",
  "weary-cat-face": "Weary Cat Face",
  "crying-cat-face": "Crying Cat Face",
  "pouting-cat-face": "Pouting Cat Face",
  "see-no-evil-monkey": "See-No-Evil Monkey",
  "hear-no-evil-monkey": "Hear-No-Evil Monkey",
  "speak-no-evil-monkey": "Speak-No-Evil Monkey",
  
  // Hearts & Symbols
  "heavy-black-heart": "Heavy Black Heart",
  
  // Food
  "avocado": "Avocado",
  "banana": "Banana"
};

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, isVisible, onToggle }) => {
  console.log('EmojiPicker rendered, isVisible:', isVisible);
  
  const handleEmojiClick = (slug: string) => {
    console.log('Emoji clicked:', slug);
    onEmojiSelect(` *${slug}* `);
  };

  if (!isVisible) {
    console.log('EmojiPicker not visible, returning null');
    return null;
  }

  return (
    <div className="emoji-picker-overlay" onClick={onToggle}>
      <div className="emoji-picker" onClick={(e) => e.stopPropagation()}>
        {Object.entries(emojiDatabase).map(([slug, name]) => (
          <div
            key={slug}
            className="emoji-item"
            onClick={() => handleEmojiClick(slug)}
            title={name}
          >
            <img 
              src={`/static/emic/${slug}.png`} 
              alt={name}
              onError={(e) => {
                console.log('Failed to load emoji:', slug);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                // console.log('Loaded emoji:', slug);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};