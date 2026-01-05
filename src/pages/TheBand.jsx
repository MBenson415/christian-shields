import React from 'react';
import './TheBand.css';

const members = [
  {
    name: "CHRISTIAN SHIELDS",
    role: "Lead Vocals, Rhythm Guitar",
    description: "Christian Shields is an American musician, multi instrumentalist, singer, songwriter, and producer from Warwick, Rhode Island. He now hails from  Austin, Texas; with over 300 shows in the United States with various groups (Last One Standing, Dreamer, Shields) and opening for bands such as: Trixter, Stryper, Jackyl, Lynch mob, Living Colour, and many others. Christian teamed up with multi-platinum award winning producer/engineer Kevin 131 Gutierrez and launched a solo career to the release of his first single “Rock and Roll” on September 27th, 2019. Two more singles followed; “Not This Time” on November 29th, 2019 and “Lie to Me” on January 17th, 2020. Following this success, Christian toured the United States in the Spring of 2025 with Trixter, Enuff 'Z Nuff, and Pretty Boy Floyd. The tour was followed up by a fan-favorite release of a new single entitled 'Fall Like Rain' as a single in September 2025.",
    image: "https://squarespacemusic.blob.core.windows.net/$web/christian.jpg"
  },
  {
    name: "MARSHALL BENSON",
    role: "Lead Guitar, Backup Vocals",
    description: "Marshall is a fluid and melodic guitarist known for more than just shred - he gives articulation and aggression to every note that has become his signature sound, and has become integral to the Christian Shields sound. Marshall adds an electrifying stage presence to the live show, and has recently stepped up into writing and arrangement duties in the studio for Christian Shields' original music.",
    image: "https://squarespacemusic.blob.core.windows.net/$web/marshallptrs.png"
  },
  {
    name: "JAKE ALLARD",
    role: "Bass, Backup Vocals",
    description: "Jake Curtis Allard is an award-winning composer and multi-instrumentalist who lends his talent on bass to Christian Shields. Jake's look and sound is unmistakable, and he's amassed a following all his own through the experience of playing with Christian Shields. Jake's voice blends seamlessly in vocal harmonies, adding a richness and complexity not normally found in Rock. Jake and Marshall have a unique chemistry on stage as a duo that is not to be missed.",
    image: "https://squarespacemusic.blob.core.windows.net/$web/jake.jpg"
  },
  {
    name: "ROM GOV",
    role: "Drums",
    description: "Hailing originally from Israel, Rom Gov is a powerhouse drummer whose style and technique drive the Christian Shields rhythm section. Rom's laser-like precision and energy are the backbone of the band's live performances, and his dynamic drumming style adds depth and excitement to every track. Rom's international experience and diverse influences bring a unique flavor to the Christian Shields sound--along with his signature hair flips behind the kit that fans become immediately drawn to.",
    image: "https://squarespacemusic.blob.core.windows.net/$web/rom.jpg"
  }
];

function TheBand() {
  return (
    <div className="the-band-page">
      <h1>THE BAND</h1>
      <div className="members-grid">
        {members.map((member, index) => (
          <div key={index} className="member-card">
            <div className="member-info">
              <h2>{member.name}</h2>
              <h3>{member.role}</h3>
              <p>{member.description}</p>
            </div>
            <div className="member-image-container">
                <img src={member.image} alt={member.name} className="member-image" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TheBand;
