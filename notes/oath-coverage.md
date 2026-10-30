# Oath — sources

Every card in Oath, and the passage it rests on. Generated from the Wikipedia
articles as fetched on 29 October 2026; each passage below was matched
mechanically against the article text, so a card whose source no longer says
what the card says fails to build rather than slipping through.

Where a clue's note adds a second detail, the second line is its source.
Facts the deck can prove about itself — eight born in Virginia, Pierce the only
one from New Hampshire, Buchanan the last born in the 1700s, Coolidge the only
Fourth of July birthday — are asserted by `scripts/test/oath.mjs` instead.

## Judgement calls

- **Andrew Jackson's birthplace** is disputed between the two Carolinas. The
  game accepts either and the card says why.
- **John Quincy Adams's 1843 photograph** is only *contended* to be the
  earliest of a president, so the clue says "one of the oldest".
- **Taft and the bathtub** is a legend; it appears once, labelled untrue.
- **Mother of Presidents**: both Virginia and Ohio are called it, so both
  state cards say the other claims it too.
- **Taylor's birthplace** is given as Orange County, as the source has it, not
  the Barboursville sometimes cited elsewhere.
- Dropped for want of a source: Eisenhower's White House putting green,
  Reagan's 77 lifeguard rescues, Hawthorne writing Pierce's campaign
  biography, Coolidge's raccoon, Hayes's White House telephone, and the
  Hoovers speaking Chinese at home. Each was replaced by a fact that is in
  the source.

## Portraits

Each portrait is the lead image of the president's English Wikipedia article,
downloaded once at 400 px wide through the Wikimedia Commons thumbnailer and
self-hosted in `games/oath/portraits/`. All are public domain except John
Adams's (CC0). Franklin Roosevelt's article leads with a CC BY 2.0 photograph,
so the public-domain 1933 portrait by Elias Goldensky is used instead.

| | File | Licence |
|---|---|---|
| washington | [Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg](https://commons.wikimedia.org/wiki/File:Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg) | Public domain |
| jadams | [Gilbert_Stuart,_John_Adams,_c._1800-1815,_NGA_42933.jpg](https://commons.wikimedia.org/wiki/File:Gilbert_Stuart,_John_Adams,_c._1800-1815,_NGA_42933.jpg) | CC0 |
| jefferson | [Official_Presidential_portrait_of_Thomas_Jefferson_(by_Rembrandt_Peale,_1800).jpg](https://commons.wikimedia.org/wiki/File:Official_Presidential_portrait_of_Thomas_Jefferson_(by_Rembrandt_Peale,_1800).jpg) | Public domain |
| madison | [James_Madison.jpg](https://commons.wikimedia.org/wiki/File:James_Madison.jpg) | Public domain |
| monroe | [James_Monroe_White_House_portrait_1819_(cropped)(2).jpg](https://commons.wikimedia.org/wiki/File:James_Monroe_White_House_portrait_1819_(cropped)(2).jpg) | Public domain |
| jqadams | [JQA_Photo_Crop_(cropped).jpg](https://commons.wikimedia.org/wiki/File:JQA_Photo_Crop_(cropped).jpg) | Public domain |
| jackson | [Andrew_jackson_head_(cropped).jpg](https://commons.wikimedia.org/wiki/File:Andrew_jackson_head_(cropped).jpg) | Public domain |
| vanburen | [Martin_Van_Buren_by_Mathew_Brady_c1855-58-(4).jpg](https://commons.wikimedia.org/wiki/File:Martin_Van_Buren_by_Mathew_Brady_c1855-58-(4).jpg) | Public domain |
| whharrison | [William_Henry_Harrison_crop.jpg](https://commons.wikimedia.org/wiki/File:William_Henry_Harrison_crop.jpg) | Public domain |
| tyler | [Tyler,_John,_by_Healy_(1842,_NPG_2019_13)_(cropped).jpg](https://commons.wikimedia.org/wiki/File:Tyler,_John,_by_Healy_(1842,_NPG_2019_13)_(cropped).jpg) | Public domain |
| polk | [James_K._Polk_restored_(3x4_cropped).jpg](https://commons.wikimedia.org/wiki/File:James_K._Polk_restored_(3x4_cropped).jpg) | Public domain |
| taylor | [Zachary_Taylor_restored_and_cropped_(3.5x4.5_cropped)_(2).jpg](https://commons.wikimedia.org/wiki/File:Zachary_Taylor_restored_and_cropped_(3.5x4.5_cropped)_(2).jpg) | Public domain |
| fillmore | [Millard_Fillmore_Better_Crop_(cropped).jpg](https://commons.wikimedia.org/wiki/File:Millard_Fillmore_Better_Crop_(cropped).jpg) | Public domain |
| pierce | [Mathew_Brady_-_Franklin_Pierce_-_alternate_crop_(cropped)(2).jpg](https://commons.wikimedia.org/wiki/File:Mathew_Brady_-_Franklin_Pierce_-_alternate_crop_(cropped)(2).jpg) | Public domain |
| buchanan | [James_Buchanan_(cropped).jpg](https://commons.wikimedia.org/wiki/File:James_Buchanan_(cropped).jpg) | Public domain |
| lincoln | [Abraham_Lincoln_O-77_matte_collodion_print.jpg](https://commons.wikimedia.org/wiki/File:Abraham_Lincoln_O-77_matte_collodion_print.jpg) | Public domain |
| ajohnson | [Andrew_Johnson_photo_portrait_head_and_shoulders,_c1870-1880-Edit1.jpg](https://commons.wikimedia.org/wiki/File:Andrew_Johnson_photo_portrait_head_and_shoulders,_c1870-1880-Edit1.jpg) | Public domain |
| grant | [Ulysses_S._Grant_1870-1880_(cropped).jpg](https://commons.wikimedia.org/wiki/File:Ulysses_S._Grant_1870-1880_(cropped).jpg) | Public domain |
| hayes | [President_Rutherford_Hayes_1870_-_1880_Restored.jpg](https://commons.wikimedia.org/wiki/File:President_Rutherford_Hayes_1870_-_1880_Restored.jpg) | Public domain |
| garfield | [James_Abram_Garfield,_photo_portrait_seated.jpg](https://commons.wikimedia.org/wiki/File:James_Abram_Garfield,_photo_portrait_seated.jpg) | Public domain |
| arthur | [Chester_A._Arthur_by_Abraham_Bogardus_(cropped)_(2).jpg](https://commons.wikimedia.org/wiki/File:Chester_A._Arthur_by_Abraham_Bogardus_(cropped)_(2).jpg) | Public domain |
| cleveland | [StephenGroverCleveland.jpg](https://commons.wikimedia.org/wiki/File:StephenGroverCleveland.jpg) | Public domain |
| bharrison | [Pach_Brothers_-_Benjamin_Harrison_(cropped)_(cropped).jpg](https://commons.wikimedia.org/wiki/File:Pach_Brothers_-_Benjamin_Harrison_(cropped)_(cropped).jpg) | Public domain |
| mckinley | [McKinley_(cropped).jpg](https://commons.wikimedia.org/wiki/File:McKinley_(cropped).jpg) | Public domain |
| troosevelt | [Theodore_Roosevelt_by_the_Pach_Bros_(4x5_cropped)_(3).jpg](https://commons.wikimedia.org/wiki/File:Theodore_Roosevelt_by_the_Pach_Bros_(4x5_cropped)_(3).jpg) | Public domain |
| taft | [William_Howard_Taft_by_Pach_Brothers_(3x4_ropped)_(cropped).jpg](https://commons.wikimedia.org/wiki/File:William_Howard_Taft_by_Pach_Brothers_(3x4_ropped)_(cropped).jpg) | Public domain |
| wilson | [President_Woodrow_Wilson_Harris_&_Ewing_(3x4_cropped_b).jpg](https://commons.wikimedia.org/wiki/File:President_Woodrow_Wilson_Harris_%26_Ewing_(3x4_cropped_b).jpg) | Public domain |
| harding | [Warren_G._Harding_1920s_portrait_(3x4_cropped).jpg](https://commons.wikimedia.org/wiki/File:Warren_G._Harding_1920s_portrait_(3x4_cropped).jpg) | Public domain |
| coolidge | [President_Calvin_Coolidge,_1924_portrait_photograph_(3x4_cropped_2).jpeg](https://commons.wikimedia.org/wiki/File:President_Calvin_Coolidge,_1924_portrait_photograph_(3x4_cropped_2).jpeg) | Public domain |
| hoover | [President_Hoover_portrait.jpg](https://commons.wikimedia.org/wiki/File:President_Hoover_portrait.jpg) | Public domain |
| froosevelt | [FDR_in_1933.jpg](https://commons.wikimedia.org/wiki/File:FDR_in_1933.jpg) | Public domain |
| truman | [TRUMAN_58-766-06_(cropped).jpg](https://commons.wikimedia.org/wiki/File:TRUMAN_58-766-06_(cropped).jpg) | Public domain |
| eisenhower | [Dwight_D._Eisenhower,_official_photo_portrait,_May_29,_1959_(cropped)(3).jpg](https://commons.wikimedia.org/wiki/File:Dwight_D._Eisenhower,_official_photo_portrait,_May_29,_1959_(cropped)(3).jpg) | Public domain |
| kennedy | [John_F._Kennedy,_White_House_color_photo_portrait.jpg](https://commons.wikimedia.org/wiki/File:John_F._Kennedy,_White_House_color_photo_portrait.jpg) | Public domain |
| lbjohnson | [Lyndon_B._Johnson,_photo_portrait,_color_(3x4_cropped)(2).jpg](https://commons.wikimedia.org/wiki/File:Lyndon_B._Johnson,_photo_portrait,_color_(3x4_cropped)(2).jpg) | Public domain |
| nixon | [Richard_Nixon_presidential_portrait_(2).jpg](https://commons.wikimedia.org/wiki/File:Richard_Nixon_presidential_portrait_(2).jpg) | Public domain |
| ford | [Gerald_Ford_presidential_portrait_(cropped).jpg](https://commons.wikimedia.org/wiki/File:Gerald_Ford_presidential_portrait_(cropped).jpg) | Public domain |
| carter | [Jimmy_Carter_Official_Portrait2_(3x4_cropped).jpg](https://commons.wikimedia.org/wiki/File:Jimmy_Carter_Official_Portrait2_(3x4_cropped).jpg) | Public domain |
| reagan | [Official_Portrait_of_President_Reagan_1981.jpg](https://commons.wikimedia.org/wiki/File:Official_Portrait_of_President_Reagan_1981.jpg) | Public domain |
| ghwbush | [George_H._W._Bush_presidential_portrait_(cropped)_(2).jpg](https://commons.wikimedia.org/wiki/File:George_H._W._Bush_presidential_portrait_(cropped)_(2).jpg) | Public domain |
| clinton | [Bill_Clinton.jpg](https://commons.wikimedia.org/wiki/File:Bill_Clinton.jpg) | Public domain |
| gwbush | [George-W-Bush.jpeg](https://commons.wikimedia.org/wiki/File:George-W-Bush.jpeg) | Public domain |
| obama | [President_Barack_Obama.jpg](https://commons.wikimedia.org/wiki/File:President_Barack_Obama.jpg) | Public domain |
| biden | [Joe_Biden_presidential_portrait.jpg](https://commons.wikimedia.org/wiki/File:Joe_Biden_presidential_portrait.jpg) | Public domain |
| trump | [Official_Presidential_Portrait_of_President_Donald_J._Trump_(2025).jpg](https://commons.wikimedia.org/wiki/File:Official_Presidential_Portrait_of_President_Donald_J._Trump_(2025).jpg) | Public domain |

## Cards

### George Washington
- Birthplace, town — [George Washington](https://en.wikipedia.org/wiki/George_Washington): “In both popular and scholarly polls, he is consistently considered one of the greatest presidents in American history. George Washington was born on February 22, 1732, at Popes Creek in Westmoreland County, Virginia.”
- Clue 1 — [George Washington](https://en.wikipedia.org/wiki/George_Washington): “Despite writing that he felt "anxious and painful sensations" about leaving Mount Vernon, Washington departed for New York City on April 16.  Washington was inaugurated on April 30, 1789, taking the oath of office at Federal Hall in New York City.”
- Clue 2 — [George Washington](https://en.wikipedia.org/wiki/George_Washington): “His 1796 farewell address became a preeminent statement on republicanism: Washington wrote about the importance of national unity and the dangers that regionalism, partisanship, and foreign influence pose to it.”
-   ↳ — [Franklin D. Roosevelt](https://en.wikipedia.org/wiki/Franklin_D._Roosevelt): “He is the longest-serving US president and the only one to have served more than two terms.”
- Clue 3 — [John Adams](https://en.wikipedia.org/wiki/John_Adams): “While Adams brought energy and dedication to the office, by mid-1789 he had already found it "not quite adapted to my character ... too inactive, and mechanical." He wrote, "My country has in its wisdom contrived for me the most insignificant office that ever the invention of man contrived or his imagination conceived." Adams's initial behavior in the Senate made him a target for critics of the Washington administ…”
- Clue 4 — [George Washington's teeth](https://en.wikipedia.org/wiki/George_Washington's_teeth): “On April 30, 1789, the day of his first presidential inauguration, although he had mostly dentures, he had only one remaining natural tooth, a premolar.”
-   ↳ — [George Washington's teeth](https://en.wikipedia.org/wiki/George_Washington's_teeth): “Despite many people believing they were made of wood, they contained no wood, and often were made of teeth extracted from slaves and other materials, including hippopotamus ivory, brass, and gold.”

### John Adams
- Birthplace, town — [John Adams](https://en.wikipedia.org/wiki/John_Adams): “Adams was born on the family farm in Braintree, Massachusetts.”
- Clue 1 — [John Adams](https://en.wikipedia.org/wiki/John_Adams): “He was the first president to reside in the White House.”
-   ↳ — [John Adams](https://en.wikipedia.org/wiki/John_Adams): “Amid the "raw and unfinished" cityscape, the President found the public buildings "in a much greater forwardness of completion than expected." He moved into the nearly completed President's Mansion (later known as the White House) on November 1.”
- Clue 2 — [John Adams](https://en.wikipedia.org/wiki/John_Adams): “An increase in attacks on sea marked the beginning of the undeclared naval war known as the Quasi-War.”
- Clue 3 — [Abigail Adams](https://en.wikipedia.org/wiki/Abigail_Adams): “She is known for her March 1776 letter to John and the Continental Congress, requesting that they, "remember the ladies, and be more generous and favorable to them than your ancestors.”
- Clue 4 — [John Adams](https://en.wikipedia.org/wiki/John_Adams): “His last words included an acknowledgement of his longtime friend and rival: "Thomas Jefferson survives." Adams was unaware that Jefferson had died several hours before.”
-   ↳ — [Thomas Jefferson](https://en.wikipedia.org/wiki/Thomas_Jefferson): “Jefferson died on July 4, 1826, at 12:50 p.m. at age 83, on the 50th anniversary of the adoption of the Declaration of Independence.”

### Thomas Jefferson
- Birthplace, town — [Thomas Jefferson](https://en.wikipedia.org/wiki/Thomas_Jefferson): “They acknowledge his lifelong ownership of large numbers of slaves, but offer varying interpretations of his views on and relationship with slavery. Jefferson was born on April 13, 1743 (April 2, 1743, Old Style, Julian calendar), at the family's Shadwell Plantation in the Colony of Virginia.”
- Clue 1 — [Thomas Jefferson](https://en.wikipedia.org/wiki/Thomas_Jefferson): “At age 33, he was one of the youngest delegates to the Second Continental Congress, which convened in the colonial capital of Philadelphia following the Battles of Lexington and Concord, which launched the American Revolutionary War in 1775.”
- Clue 2 — [Louisiana Purchase](https://en.wikipedia.org/wiki/Louisiana_Purchase): “In return for $15 million, or approximately $18 per square mile ($7/km2), the United States nominally acquired a total of 828,000 sq mi (2,140,000 km2; 530,000,000 acres) of land now in the Central United States.”
-   ↳ — [Louisiana Purchase](https://en.wikipedia.org/wiki/Louisiana_Purchase): “The Louisiana Purchase extended United States sovereignty across the Mississippi River, nearly doubling the nominal size of the country.”
- Clue 3 — [Thomas Jefferson](https://en.wikipedia.org/wiki/Thomas_Jefferson): “Presidential scholars and historians have praised Jefferson's advocacy of religious freedom and tolerance, his peaceful acquisition of the Louisiana Territory from France, and his leadership in supporting the Lewis and Clark Expedition.”
- Clue 4 — [Library of Congress](https://en.wikipedia.org/wiki/Library_of_Congress): “Congress accepted former president Thomas Jefferson's offer to sell his entire personal collection of 6,487 books to restore the library.”
-   ↳ — [Library of Congress](https://en.wikipedia.org/wiki/Library_of_Congress): “The collection grew slowly and suffered another major fire in 1851, which destroyed two-thirds of Jefferson's original books.”

### James Madison
- Birthplace, town — [James Madison](https://en.wikipedia.org/wiki/James_Madison): “Madison's name is commemorated in many landmarks across the nation, with prominent examples including Madison Square Garden, James Madison University, the James Madison Memorial Building, the capital city of Wisconsin, and the USS James Madison. James Madison Jr. was born on March 16, 1751 (March 5, 1750, Old Style), at the Belle Grove plantation near Port Conway in the Colony of Virginia, to James Madison Sr. and…”
- Clue 1 — [James Madison](https://en.wikipedia.org/wiki/James_Madison): “Madison was popularly acclaimed as the "Father of the Constitution" for his pivotal role in drafting and promoting the Constitution of the United States and the Bill of Rights.”
- Clue 2 — [James Madison](https://en.wikipedia.org/wiki/James_Madison): “Motivated by a desire to acquire land held by Britain, Spain, and Native Americans, and after diplomatic protests with a trade embargo failed to end British seizures of American-shipped goods, Madison led the United States into the War of 1812.”
-   ↳ — [James Madison](https://en.wikipedia.org/wiki/James_Madison): “Despite these successes, the British continued to repel American attempts to invade Canada, and a British force captured Fort Niagara and burned the American city of Buffalo in late 1813.”
- Clue 3 — [James Madison](https://en.wikipedia.org/wiki/James_Madison): “Dolley bravely secured the portrait of George Washington, before she abandoned the White House, escaped British capture, and fled to Virginia.”
- Clue 4 — [Heights of presidents and presidential candidates of the United States](https://en.wikipedia.org/wiki/Heights_of_presidents_and_presidential_candidates_of_the_United_States): “The tallest U.S. president was Abraham Lincoln at 6 feet 4 inches (193 centimeters), while the shortest was James Madison at 5 feet 4 inches (163 centimeters).”

### James Monroe
- Birthplace, town — [James Monroe](https://en.wikipedia.org/wiki/James_Monroe): “Historians have generally ranked him as an above-average president. James Monroe was born on April 28, 1758, in his parents' house in a wooded area of Westmoreland County in the Colony of Virginia, to Andrew Spence Monroe and Elizabeth Jones.”
- Clue 1 — [James Monroe](https://en.wikipedia.org/wiki/James_Monroe): “On December 2, 1823, in his annual message to Congress, Monroe articulated what became known as the Monroe Doctrine.”
-   ↳ — [Monroe Doctrine](https://en.wikipedia.org/wiki/Monroe_Doctrine): “President James Monroe first articulated the doctrine on December 2, 1823, during his seventh annual State of the Union Address to Congress (though it was not named after him until 1850).”
- Clue 2 — [James Monroe](https://en.wikipedia.org/wiki/James_Monroe): “A member of the Democratic-Republican Party, Monroe's presidency coincided with the Era of Good Feelings, in which the First Party System era of American politics concluded.”
- Clue 3 — [James Monroe](https://en.wikipedia.org/wiki/James_Monroe): “Recognizing Northern discontent at the continuation of the Virginia dynasty, Monroe chose John Quincy Adams of Massachusetts as Secretary of State, making Adams the early favorite to eventually succeed Monroe.”
- Clue 4 — [James Monroe](https://en.wikipedia.org/wiki/James_Monroe): “Political scientist Fred Greenstein argues that Monroe was a more effective executive than some of his better-known predecessors, including Madison and John Adams. The capital of Liberia is named Monrovia after Monroe; it is the only national capital other than Washington, D.C., named after a U.S. president.”

### John Quincy Adams
- Birthplace, town — [John Quincy Adams](https://en.wikipedia.org/wiki/John_Quincy_Adams): “While historians typically rank Adams as an average to above-average president, they generally consider him one of the greatest diplomats and secretaries of state in American history, whose powerlessness as chief executive was followed by vehement speeches against slavery and for the rights of women and Native Americans during his post-presidential congressional career. John Quincy Adams was born on July 11, 1767,…”
- Clue 1 — [John Quincy Adams](https://en.wikipedia.org/wiki/John_Quincy_Adams): “While historians typically rank Adams as an average to above-average president, they generally consider him one of the greatest diplomats and secretaries of state in American history, whose powerlessness as chief executive was followed by vehement speeches against slavery and for the rights of women and Native Americans during his post-presidential congressional career. John Quincy Adams was born on July 11, 1767,…”
- Clue 2 — [John Quincy Adams](https://en.wikipedia.org/wiki/John_Quincy_Adams): “Because no candidate won a majority of electoral votes, the House of Representatives held a contingent election, which Adams won with the support of Speaker of the House Clay, whom Adams would controversially appoint as his secretary of state.”
- Clue 3 — [John Quincy Adams](https://en.wikipedia.org/wiki/John_Quincy_Adams): “In 1841, the 73-year-old Adams successfully defended enslaved mutineers in the Amistad case before the Supreme Court.”
- Clue 4 — [John Quincy Adams](https://en.wikipedia.org/wiki/John_Quincy_Adams): “Some sources contend that in 1843 Adams sat for the earliest confirmed photograph of a United States president, although others maintain that William Henry Harrison had posed even earlier for his portrait, in 1841.”

### Andrew Jackson
- Birthplace, town — [Andrew Jackson](https://en.wikipedia.org/wiki/Andrew_Jackson): “In recent decades, his reputation has declined and his ranking has fallen.  Andrew Jackson was born on March 15, 1767, in the Waxhaws region of the Carolinas.”
-   ↳ — [Andrew Jackson](https://en.wikipedia.org/wiki/Andrew_Jackson): “Jackson later stated that he was born on the Crawford plantation, which is in Lancaster County, South Carolina, but second-hand evidence suggests that he might have been born at another uncle's home in North Carolina.”
- Clue 1 — [United States twenty-dollar bill](https://en.wikipedia.org/wiki/United_States_twenty-dollar_bill): “A portrait of Andrew Jackson, the seventh U.S. president (1829–1837), has been featured on the obverse of the note since 1928; the White House is featured on the reverse.”
-   ↳ — [United States twenty-dollar bill](https://en.wikipedia.org/wiki/United_States_twenty-dollar_bill): “The placement of Jackson on the $20 note is considered ironic; as president, he vehemently opposed both the National Bank and use of paper money.”
- Clue 2 — [Andrew Jackson](https://en.wikipedia.org/wiki/Andrew_Jackson): “In May 1830, Jackson signed the Indian Removal Act, which Congress had narrowly passed.”
-   ↳ — [Andrew Jackson](https://en.wikipedia.org/wiki/Andrew_Jackson): “It resulted in thousands of deaths in what has become known as the Trail of Tears.”
- Clue 3 — [Andrew Jackson](https://en.wikipedia.org/wiki/Andrew_Jackson): “Jackson refused to disband his troops; instead, he led them on the difficult march back to Nashville, earning the nickname "Hickory" (later "Old Hickory") for his toughness.”
- Clue 4 — [Andrew Jackson](https://en.wikipedia.org/wiki/Andrew_Jackson): “Andrew refused, and the officer slashed him with a sword, leaving him with scars on his left hand and head.”

### Martin Van Buren
- Birthplace, town — [Martin Van Buren](https://en.wikipedia.org/wiki/Martin_Van_Buren): “Van Buren died of asthma at his home in Kinderhook in 1862, at age 79. Martin Van Buren was born on December 5, 1782, in Kinderhook, New York, His father, Abraham Van Buren, was a descendant of Cornelis Maessen, a native of Buurmalsen, Netherlands, who had emigrated to New Netherland in 1631 and purchased a plot of land on Manhattan Island.”
- Clue 1 — [Martin Van Buren](https://en.wikipedia.org/wiki/Martin_Van_Buren): “He is the only president to have spoken English as a second language.”
- Clue 2 — [Martin Van Buren](https://en.wikipedia.org/wiki/Martin_Van_Buren): “However, his popularity soon eroded because of his response to the Panic of 1837, which centered on his Independent Treasury system, a plan under which the federal government of the United States would store its funds in vaults rather than in banks.”
- Clue 3 — [Martin Van Buren](https://en.wikipedia.org/wiki/Martin_Van_Buren): “At Jackson's behest, the 1832 Democratic National Convention nominated Van Buren for vice president, and he took office after the Democratic ticket won the 1832 presidential election.”
- Clue 4 — [Martin Van Buren](https://en.wikipedia.org/wiki/Martin_Van_Buren): “Van Buren, whose nickname "Old Kinderhook" referenced his birthplace in Kinderhook, New York, used the term as a symbol of approval and solidarity among his supporters.”
-   ↳ — [Martin Van Buren](https://en.wikipedia.org/wiki/Martin_Van_Buren): “Although "OK" was initially popularized as a humorous abbreviation for "oll korrect" (a deliberate misspelling of "all correct") in newspapers during the late 1830s, its association with Van Buren's campaign helped solidify its place in American vernacular.”

### William Henry Harrison
- Birthplace, town — [William Henry Harrison](https://en.wikipedia.org/wiki/William_Henry_Harrison): “Born on February 9, 1773, at Berkeley Plantation, the home of the Harrison family of Virginia on the James River in Charles City County, he became the last United States president not born as an American citizen.”
-   ↳ — [William Henry Harrison](https://en.wikipedia.org/wiki/William_Henry_Harrison): “Born on February 9, 1773, at Berkeley Plantation, the home of the Harrison family of Virginia on the James River in Charles City County, he became the last United States president not born as an American citizen.”
- Clue 1 — [William Henry Harrison](https://en.wikipedia.org/wiki/William_Henry_Harrison): “He was the shortest-serving president, at 31 days, and the first one to die in office.”
- Clue 2 — [William Henry Harrison](https://en.wikipedia.org/wiki/William_Henry_Harrison): “He braved the chilly weather and chose not to wear an overcoat or a hat, rode on horseback to the grand ceremony, and then delivered the longest inaugural address in American history at 8,445 words.”
-   ↳ — [William Henry Harrison](https://en.wikipedia.org/wiki/William_Henry_Harrison): “Mackowiak did an analysis in Clinical Infectious Diseases (2014), examining Miller's notes and records showing that the White House water supply was downstream of public sewage, and they concluded that he likely died of septic shock due to "enteric fever" (typhoid or paratyphoid fever).”
- Clue 3 — [William Henry Harrison](https://en.wikipedia.org/wiki/William_Henry_Harrison): “In the 1840 presidential election, the party nominated him again, with John Tyler as his running mate, under the campaign slogan "Tippecanoe and Tyler Too", and Harrison defeated Van Buren.”
- Clue 4 — [Benjamin Harrison](https://en.wikipedia.org/wiki/Benjamin_Harrison): “Benjamin Harrison (August 20, 1833 – March 13, 1901) was the 23rd president of the United States, serving from 1889 to 1893.”

### John Tyler
- Birthplace, town — [John Tyler](https://en.wikipedia.org/wiki/John_Tyler): “In the 21st century, Tyler is seldom remembered when in comparison to other presidents and maintains only a limited presence in American cultural memory. John Tyler was born on March 29, 1790, to a prominent slave-owning Virginia family.”
-   ↳ — [John Tyler](https://en.wikipedia.org/wiki/John_Tyler): “With his two brothers and five sisters, Tyler was reared on Greenway Plantation, a 1,200-acre (5 km2) estate with a six-room manor house his father had built.”
- Clue 1 — [John Tyler](https://en.wikipedia.org/wiki/John_Tyler): “Amid uncertainty as to whether a vice president succeeded a deceased president, or merely took on his duties, Tyler immediately took the presidential oath of office and assumed full presidential powers, setting the Tyler Precedent.”
- Clue 2 — [John Tyler](https://en.wikipedia.org/wiki/John_Tyler): “Tyler believed in manifest destiny and saw the annexation of Texas as economically and internationally advantageous to the United States, signing a bill to offer Texas statehood just before leaving office.”
- Clue 3 — [John Tyler](https://en.wikipedia.org/wiki/John_Tyler): “Almost all of Tyler's cabinet resigned shortly into his term, and the Whigs expelled him from the party and dubbed him "His Accidency".”
- Clue 4 — [John Tyler](https://en.wikipedia.org/wiki/John_Tyler): “As Seager remarked: "His countrymen generally remember him, if they have heard of him at all, as the rhyming end of a catchy campaign slogan." Tyler fathered 15 children, more than any other American president.”

### James K. Polk
- Birthplace, town — [James K. Polk](https://en.wikipedia.org/wiki/James_K._Polk): “He helped make the U.S. a nation poised to become a great power, but his policies gravely exacerbated divisions between the free and slave states, setting the stage for the American Civil War. James Knox Polk was born on November 2, 1795, in a log cabin in Pineville, North Carolina.”
- Clue 1 — [James K. Polk](https://en.wikipedia.org/wiki/James_K._Polk): “In the general election, he narrowly defeated Henry Clay of the Whig Party and pledged to serve only one term.”
- Clue 2 — [James K. Polk](https://en.wikipedia.org/wiki/James_K._Polk): “In late 1845, He sent John Slidell to Mexico to purchase New Mexico and California for $30 million ($1,036,607,143 in 2025 dollars ), as well as securing Mexico's agreement to a Rio Grande border.”
- Clue 3 — [James K. Polk](https://en.wikipedia.org/wiki/James_K._Polk): “Polk has been described as the first "dark horse" presidential nominee, although his nomination was less of a surprise than that of future nominees such as Franklin Pierce or Warren G.”
- Clue 4 — [James K. Polk](https://en.wikipedia.org/wiki/James_K._Polk): “At age 53, Polk had the shortest lifespan of any president not assassinated, and the shortest post-presidency among the presidents who did not die in office (103 days).”

### Zachary Taylor
- Birthplace, town — [Zachary Taylor](https://en.wikipedia.org/wiki/Zachary_Taylor): “Historians and scholars have ranked Taylor in the bottom quartile of U.S. presidents, owing in part to his short term of office (16 months), though he has been described as "more a forgettable president than a failed one". Zachary Taylor was born on November 24, 1784, on a plantation in Orange County, Virginia, to a prominent family of planters of English ancestry.”
- Clue 1 — [Zachary Taylor](https://en.wikipedia.org/wiki/Zachary_Taylor): “Defying orders, Taylor led his troops further south and, though severely outnumbered, repelled Mexican forces under General Antonio López de Santa Anna at the Battle of Buena Vista, forcing a withdrawal but without a clear-cut victory.”
- Clue 2 — [Zachary Taylor](https://en.wikipedia.org/wiki/Zachary_Taylor): “The House of Representatives voted to censure Taylor, and newspapers of both parties began calling for his impeachment.  On July 4, 1850, Taylor reportedly consumed copious amounts of cherries and iced milk while attending holiday celebrations during a fundraising event at the Washington Monument, which was then under construction.”
-   ↳ — [Zachary Taylor](https://en.wikipedia.org/wiki/Zachary_Taylor): “He died 16 months into his term from a stomach disease.”
- Clue 3 — [Zachary Taylor](https://en.wikipedia.org/wiki/Zachary_Taylor): “His success in the Second Seminole War attracted national attention and earned him the nickname "Old Rough and Ready".”
- Clue 4 — [Zachary Taylor](https://en.wikipedia.org/wiki/Zachary_Taylor): “Army on January 31, 1849, shortly before he became president. In his capacity as a career officer, Taylor had never publicly revealed his political beliefs before 1848 nor voted before that time.”

### Millard Fillmore
- Birthplace, town — [Millard Fillmore](https://en.wikipedia.org/wiki/Millard_Fillmore): “Historians usually rank Fillmore among the worst presidents in American history, largely for his policies regarding slavery, as well as among the least memorable. Millard Fillmore was born on January 7, 1800, in a log cabin, on a farm in what is now Moravia, in the Finger Lakes region of New York.”
- Clue 1 — [Millard Fillmore](https://en.wikipedia.org/wiki/Millard_Fillmore): “House of Representatives, Fillmore was elected vice president in 1848, and succeeded to the presidency when Zachary Taylor died in 1850.”
- Clue 2 — [Millard Fillmore](https://en.wikipedia.org/wiki/Millard_Fillmore): “The Fugitive Slave Act of 1850, expediting the return of escaped slaves to those who claimed ownership, was a controversial part of the compromise.”
- Clue 3 — [Millard Fillmore](https://en.wikipedia.org/wiki/Millard_Fillmore): “Navy expeditions to open trade in Japan, opposed French designs on Hawaii, and was embarrassed by Narciso López's filibuster expeditions to Cuba.”
- Clue 4 — [Millard Fillmore](https://en.wikipedia.org/wiki/Millard_Fillmore): “Fillmore and his wife, Abigail, established the first White House library.”

### Franklin Pierce
- Birthplace, town — [Franklin Pierce](https://en.wikipedia.org/wiki/Franklin_Pierce): “As a result of his support of the South, as well as failing to hold the Union together in time of strife, historians and scholars generally rank Pierce as one of the worst and least memorable U.S. presidents.  Franklin Pierce was born on November 23, 1804, in a log cabin in Hillsborough, New Hampshire.”
- Clue 1 — [Franklin Pierce](https://en.wikipedia.org/wiki/Franklin_Pierce): “Pierce, then the youngest man to be elected president, chose to affirm his oath of office on a Bible, as all his predecessors except John Quincy Adams, who swore on a book of law, had done.”
- Clue 2 — [Franklin Pierce](https://en.wikipedia.org/wiki/Franklin_Pierce): “A northern Democrat who believed that the abolitionist movement was a fundamental threat to national unity, he alienated anti-slavery groups by signing the Kansas–Nebraska Act and enforcing the Fugitive Slave Act.”
- Clue 3 — [Franklin Pierce](https://en.wikipedia.org/wiki/Franklin_Pierce): “He joined the Athenian Society, a progressive literary society, alongside Jonathan Cilley (later elected to Congress) and Nathaniel Hawthorne, with whom he formed lasting friendships.”
-   ↳ — [Franklin Pierce](https://en.wikipedia.org/wiki/Franklin_Pierce): “As senator, he was able to help his old friend Nathaniel Hawthorne, who often struggled financially, procuring for him a sinecure as measurer of coal and salt at the Boston Customs House that allowed the author time to continue writing.”
- Clue 4 — [Franklin Pierce](https://en.wikipedia.org/wiki/Franklin_Pierce): “He was the first president to deliver his inaugural address from memory.”

### James Buchanan
- Birthplace, town — [James Buchanan](https://en.wikipedia.org/wiki/James_Buchanan): “Historians and scholars rank him among the worst presidents in American history.  James Buchanan Jr. was born into a Scotch-Irish family on April 23, 1791, in a log cabin at the Stony Batter farm, near Cove Gap in the Allegheny Mountains of southern Pennsylvania.”
- Clue 1 — [James Buchanan](https://en.wikipedia.org/wiki/James_Buchanan): “He was the only president of the United States who never married.”
- Clue 2 — [James Buchanan](https://en.wikipedia.org/wiki/James_Buchanan): “In his final months in office, seven Southern states seceded, forming the Confederacy.”
- Clue 3 — [James Buchanan](https://en.wikipedia.org/wiki/James_Buchanan): “During his presidency, an orphaned niece, Harriet Lane, whom he had adopted, served as official White House hostess.”
- Clue 4 — [James Buchanan](https://en.wikipedia.org/wiki/James_Buchanan): “James Buchanan Jr. (April 23, 1791 – June 1, 1868) was the 15th president of the United States, serving from 1857 to 1861.”

### Abraham Lincoln
- Birthplace, town — [Abraham Lincoln](https://en.wikipedia.org/wiki/Abraham_Lincoln): “He is consistently ranked in both popular and scholarly polls as among the greatest presidents in American history. Born in a one-room log cabin in Kentucky on February 12, 1809, Abraham Lincoln was raised on Sinking Spring Farm and Knob Creek Farm near Hodgenville, Kentucky.”
- Clue 1 — [Abraham Lincoln](https://en.wikipedia.org/wiki/Abraham_Lincoln): “On January 1, 1863, he issued the Emancipation Proclamation, which declared the slaves in the states "in rebellion" to be free.”
- Clue 2 — [Abraham Lincoln](https://en.wikipedia.org/wiki/Abraham_Lincoln): “On November 19, 1863, he delivered the Gettysburg Address, which became one of the most famous speeches in American history.”
- Clue 3 — [Abraham Lincoln](https://en.wikipedia.org/wiki/Abraham_Lincoln): “He reached a national audience in the 1858 Senate campaign debates against Stephen A.”
-   ↳ — [1860 United States presidential election](https://en.wikipedia.org/wiki/1860_United_States_presidential_election): “Douglas as the Northern Democratic presidential candidate.”
- Clue 4 — [Abraham Lincoln](https://en.wikipedia.org/wiki/Abraham_Lincoln): “His patent was never commercialized, but it made Lincoln the only president to hold a patent.”

### Andrew Johnson
- Birthplace, town — [Andrew Johnson](https://en.wikipedia.org/wiki/Andrew_Johnson): “Johnson's strong opposition to federally guaranteed rights for African Americans is widely criticized, and historians have consistently ranked him as one of the worst U.S. presidents.  Andrew Johnson was born in Raleigh, North Carolina, on December 29, 1808, to Jacob Johnson and Mary ("Polly") McDonough, a laundress.”
- Clue 1 — [Andrew Johnson](https://en.wikipedia.org/wiki/Andrew_Johnson): “The shooting of the President was part of a conspiracy to assassinate Lincoln, Johnson, and Seward the same night.”
- Clue 2 — [Andrew Johnson](https://en.wikipedia.org/wiki/Andrew_Johnson): “Thirty-five senators voted "guilty" and 19 "not guilty", thus falling short by a single vote of the two-thirds majority required for conviction under the Constitution.”
- Clue 3 — [Alaska Purchase](https://en.wikipedia.org/wiki/Alaska_Purchase): “Some opponents labeled the purchase as "Seward's Folly" or "Seward's Icebox" as they contended that the United States had acquired useless land.”
-   ↳ — [Alaska Purchase](https://en.wikipedia.org/wiki/Alaska_Purchase): “The Alaska Purchase in 1867 resulted in the transfer of Russian America to the United States for $7.2 million (equivalent to $136 million in 2025).”
- Clue 4 — [Andrew Johnson](https://en.wikipedia.org/wiki/Andrew_Johnson): “Johnson was born into poverty and never attended school.”
-   ↳ — [Andrew Johnson](https://en.wikipedia.org/wiki/Andrew_Johnson): “He was apprenticed as a tailor and worked in several frontier towns before settling in Greeneville, Tennessee, serving as an alderman and mayor before being elected to the Tennessee House of Representatives in 1835.”

### Ulysses S. Grant
- Birthplace, town — [Grant Birthplace](https://en.wikipedia.org/wiki/Grant_Birthplace): “Grant Birthplace) is a historic house museum in Point Pleasant, Monroe Township, Clermont County, Ohio, United States.”
-   ↳ — [Ulysses S. Grant](https://en.wikipedia.org/wiki/Ulysses_S._Grant): “He and Hannah Simpson were married on June 24, 1821, and their first child, Hiram Ulysses Grant, was born on April 27, 1822.”
- Clue 1 — [Ulysses S. Grant](https://en.wikipedia.org/wiki/Ulysses_S._Grant): “Grant (born Hiram Ulysses Grant; April 27, 1822 – July 23, 1885) was the 18th president of the United States, serving from 1869 to 1877, and was the Commanding General of the Union Army.”
- Clue 2 — [Ulysses S. Grant](https://en.wikipedia.org/wiki/Ulysses_S._Grant): “In March 1872, Grant signed legislation that established Yellowstone National Park, the first national park.”
- Clue 3 — [Ulysses S. Grant](https://en.wikipedia.org/wiki/Ulysses_S._Grant): “In 1885, dying of throat cancer, Grant wrote his memoirs, which were posthumously published and became a major critical and financial success.”
-   ↳ — [Ulysses S. Grant](https://en.wikipedia.org/wiki/Ulysses_S._Grant): “However, Grant's friend Mark Twain, one of the few who understood Grant's precarious financial condition, offered him an unheard-of 70% royalty.”
- Clue 4 — [Ulysses S. Grant](https://en.wikipedia.org/wiki/Ulysses_S._Grant): “Unfamiliar with Grant, Hamer altered his name, so Grant was enlisted under the name "U.”

### Rutherford B. Hayes
- Birthplace, town — [Rutherford B. Hayes](https://en.wikipedia.org/wiki/Rutherford_B._Hayes): “Historians and scholars generally rank Hayes as an below-average to average president.  Rutherford Birchard Hayes was born in Delaware, Ohio, on October 4, 1822, to Rutherford Ezekiel Hayes, Jr. and Sophia Birchard.”
- Clue 1 — [1876 United States presidential election](https://en.wikipedia.org/wiki/1876_United_States_presidential_election): “Bradley then joined the other seven Republican committee members in a series of 8–7 votes that gave all 20 disputed electoral votes to Hayes, which gave Hayes a 185–184 electoral vote victory.”
-   ↳ — [1876 United States presidential election](https://en.wikipedia.org/wiki/1876_United_States_presidential_election): “Although Tilden defeated Hayes in the official popular vote tally, the election involved substantial electoral fraud, voter intimidation by paramilitary groups such as the Red Shirts, and disenfranchisement of black Republicans.”
- Clue 2 — [Rutherford B. Hayes](https://en.wikipedia.org/wiki/Rutherford_B._Hayes): “The electoral dispute was reportedly settled in an agreement between Southern Democrats and Whiggish Republican businessmen whereby Hayes would be president but end both federal support for Reconstruction and the military occupation of the former Confederacy, though the existence of such a deal remains heavily disputed.”
- Clue 3 — [White House Easter Egg Roll](https://en.wikipedia.org/wiki/White_House_Easter_Egg_Roll): “Hayes and first lady Lucy Hayes brought the event to the White House lawns in 1878.”
- Clue 4 — [Rutherford B. Hayes](https://en.wikipedia.org/wiki/Rutherford_B._Hayes): “He was wounded five times, most seriously at the Battle of South Mountain in 1862.”
-   ↳ — [Rutherford B. Hayes](https://en.wikipedia.org/wiki/Rutherford_B._Hayes): “Asked by friends in Cincinnati to leave the army to campaign, he refused, saying that an "officer fit for duty who at this crisis would abandon his post to electioneer for a seat in Congress ought to be scalped." Instead, Hayes wrote several letters to the voters explaining his political positions and was elected by a 2,400-vote majority over the incumbent, Democrat Alexander Long.”

### James A. Garfield
- Birthplace, town — [James A. Garfield](https://en.wikipedia.org/wiki/James_A._Garfield): “Due to Garfield's brief term in office and lack of major changes during his tenure, historians tend to rank him as a below-average president or omit his name entirely from rankings, though some view Garfield's potential favorably, praising him for his anti-corruption and pro-civil rights stances. James Abram Garfield was born the youngest of five children on November 19, 1831, in a log cabin in Orange Township, wh…”
- Clue 1 — [James A. Garfield](https://en.wikipedia.org/wiki/James_A._Garfield): “He died on September 19 from infections related to the wounds and was succeeded by Vice President Chester A.”
- Clue 2 — [James A. Garfield](https://en.wikipedia.org/wiki/James_A._Garfield): “A preacher, lawyer, and Civil War general, Garfield served nine terms in the United States House of Representatives and is the only sitting member of the House to be elected president.”
- Clue 3 — [James A. Garfield](https://en.wikipedia.org/wiki/James_A._Garfield): “Alexander Graham Bell tried to locate the bullet with a primitive metal detector but was unsuccessful, though the device had been effective when tested on others.”
- Clue 4 — [James A. Garfield](https://en.wikipedia.org/wiki/James_A._Garfield): “Garfield instead found work on a canal boat, managing the mules that pulled it.”

### Chester A. Arthur
- Birthplace, town — [Chester A. Arthur](https://en.wikipedia.org/wiki/Chester_A._Arthur): “Arthur was born in Fairfield, Vermont, and practiced law in New York City.”
-   ↳ — [Chester A. Arthur](https://en.wikipedia.org/wiki/Chester_A._Arthur): “When Hinman's original story did not take root, he spread a new rumor that Arthur was born in Canada.”
- Clue 1 — [James A. Garfield](https://en.wikipedia.org/wiki/James_A._Garfield): “He died on September 19 from infections related to the wounds and was succeeded by Vice President Chester A.”
- Clue 2 — [Chester A. Arthur](https://en.wikipedia.org/wiki/Chester_A._Arthur): “Arthur signed into law the Pendleton Civil Service Reform Act of 1883, which came as a surprise to reformers who held a negative opinion of Arthur as a Stalwart and product of Conkling's organization.”
- Clue 3 — [Chester A. Arthur](https://en.wikipedia.org/wiki/Chester_A._Arthur): “Jones, while a White House remodeling he had ordered was carried out, including addition of an elaborate fifty-foot glass screen by Louis Comfort Tiffany.”
- Clue 4 — [Chester A. Arthur](https://en.wikipedia.org/wiki/Chester_A._Arthur): “Arthur's successor, Grover Cleveland, finding that title belonged to the Native Americans, revoked Arthur's order a few months later. Shortly after becoming president, Arthur was diagnosed with Bright's disease, a kidney ailment now referred to as nephritis.”

### Grover Cleveland
- Birthplace, town — [Grover Cleveland](https://en.wikipedia.org/wiki/Grover_Cleveland): “He died in 1908.  Stephen Grover Cleveland was born on March 18, 1837, in Caldwell, New Jersey, to Ann (née Neal) and Richard Falley Cleveland.”
- Clue 1 — [Donald Trump](https://en.wikipedia.org/wiki/Donald_Trump): “He became the oldest to assume the presidency, the first president with a felony conviction, and the second to serve two nonconsecutive terms.”
- Clue 2 — [Grover Cleveland](https://en.wikipedia.org/wiki/Grover_Cleveland): “The wedding occurred on June 2, 1886, in the Blue Room at the White House.”
- Clue 3 — [Grover Cleveland](https://en.wikipedia.org/wiki/Grover_Cleveland): “In the 1888 election, Cleveland won the popular vote but lost the electoral college and therefore the election to Benjamin Harrison.”
- Clue 4 — [Grover Cleveland](https://en.wikipedia.org/wiki/Grover_Cleveland): “The surgeons operated aboard the Oneida, a yacht owned by Cleveland's friend Elias Cornelius Benedict, as it sailed off Long Island.”

### Benjamin Harrison
- Birthplace, town — [Benjamin Harrison](https://en.wikipedia.org/wiki/Benjamin_Harrison): “He died at his home in Indianapolis in 1901 of complications from influenza. Harrison was born on August 20, 1833, in North Bend, Ohio, the second of Elizabeth Ramsey (Irwin) and John Scott Harrison's ten children.”
- Clue 1 — [William Henry Harrison](https://en.wikipedia.org/wiki/William_Henry_Harrison): “A member of the Harrison family of Virginia, he was a son of Benjamin Harrison V, a Founding Father, and the father of John Scott Harrison, the only son and father of two presidents of the United States.”
- Clue 2 — [Benjamin Harrison](https://en.wikipedia.org/wiki/Benjamin_Harrison): “During his administration six western states were admitted to the Union.”
- Clue 3 — [Grover Cleveland](https://en.wikipedia.org/wiki/Grover_Cleveland): “In the 1888 election, Cleveland won the popular vote but lost the electoral college and therefore the election to Benjamin Harrison.”
- Clue 4 — [Benjamin Harrison](https://en.wikipedia.org/wiki/Benjamin_Harrison): “Harrison also had electricity installed in the White House for the first time by Edison General Electric Company, but he and his wife did not touch the light switches for fear of electrocution and often went to sleep with the lights on.”

### William McKinley
- Birthplace, town — [William McKinley](https://en.wikipedia.org/wiki/William_McKinley): “McKinley is generally ranked among the middle tier of presidents. William McKinley Jr. was born in 1843 in Niles, Ohio, the seventh of nine children of William McKinley Sr. and Nancy (née Allison) McKinley.”
- Clue 1 — [William McKinley](https://en.wikipedia.org/wiki/William_McKinley): “Still, when negotiations failed, he requested and signed Congress's declaration of war to begin the Spanish–American War of 1898, in which the United States saw a quick and decisive victory.”
- Clue 2 — [William McKinley](https://en.wikipedia.org/wiki/William_McKinley): “The United States annexed the independent Republic of Hawaii in 1898, and it became the Territory of Hawaii in 1900.”
- Clue 3 — [William McKinley](https://en.wikipedia.org/wiki/William_McKinley): “Traveling mostly by rail, the McKinleys were to travel through the South to the Southwest, and then up the Pacific coast and east again, to conclude with a visit on June 13, 1901, to the Pan-American Exposition in Buffalo, New York.”
- Clue 4 — [William McKinley](https://en.wikipedia.org/wiki/William_McKinley): “Thousands of partisans came from Canton and surrounding towns that evening to hear McKinley speak from his front porch.”

### Theodore Roosevelt
- Birthplace, town — [Theodore Roosevelt](https://en.wikipedia.org/wiki/Theodore_Roosevelt): “Polls of historians and political scientists rank him as one of the greatest presidents in American history. Theodore Roosevelt Jr. was born at 28 East 20th Street in Manhattan, New York on October 27, 1858.”
- Clue 1 — [Teddy bear](https://en.wikipedia.org/wiki/Teddy_bear): “A party of Roosevelt's attendants, led by freedman Holt Collier, cornered, clubbed, and tied an American black bear to a willow tree after a long and exhausting chase with hounds.”
- Clue 2 — [Theodore Roosevelt](https://en.wikipedia.org/wiki/Theodore_Roosevelt): “In foreign policy, he focused on Central America, beginning construction of the Panama Canal.”
- Clue 3 — [Theodore Roosevelt](https://en.wikipedia.org/wiki/Theodore_Roosevelt): “He resigned to help form and lead the Rough Riders, a unit that fought the Spanish Army in Cuba to great publicity.”
- Clue 4 — [Theodore Roosevelt](https://en.wikipedia.org/wiki/Theodore_Roosevelt): “He was the youngest person to be president, aged 42 upon his first inauguration.”

### William Howard Taft
- Birthplace, town — [William Howard Taft](https://en.wikipedia.org/wiki/William_Howard_Taft): “In popular memory his political achievements and role in Republican Party history have been overshadowed by his weight and physical appearance. William Howard Taft was born September 15, 1857, in Cincinnati, Ohio, to Alphonso Taft and Louise Torrey.”
- Clue 1 — [William Howard Taft](https://en.wikipedia.org/wiki/William_Howard_Taft): “William Howard Taft (September 15, 1857 – March 8, 1930) was the 27th president of the United States from 1909 to 1913 and the tenth chief justice of the United States from 1921 to 1930.”
- Clue 2 — [Ceremonial first pitch](https://en.wikipedia.org/wiki/Ceremonial_first_pitch): “In Banana Ball, the baseball variant developed by the Savannah Bananas in the early-to-mid 2020s, ceremonial first pitches affect the first batter's starting count. The American tradition of presidential first pitches began in 1910, when United States President William Howard Taft threw the ceremonial first pitch at the Washington Senators' Opening Day at Griffith Stadium.”
- Clue 3 — [William Howard Taft](https://en.wikipedia.org/wiki/William_Howard_Taft): “Scott Bomboy for the National Constitution Center wrote that despite being "one of the most interesting, intellectual, and versatile presidents ... a chief justice of the United States, a wrestler at Yale, a reformer, a peace activist, and a baseball fan ... today, Taft is best remembered as the president who was so large that he got stuck in the White House bathtub", a story that is not true.”
- Clue 4 — [Helen Herron Taft](https://en.wikipedia.org/wiki/Helen_Herron_Taft): “She also arranged for the planting of Japanese cherry trees, accepting a donation of trees from the mayor of Tokyo, who was a friend of the Tafts.”

### Woodrow Wilson
- Birthplace, town — [Woodrow Wilson](https://en.wikipedia.org/wiki/Woodrow_Wilson): “Born in Staunton, Virginia, Wilson grew up in the Southern United States during the American Civil War and Reconstruction era.”
- Clue 1 — [Woodrow Wilson](https://en.wikipedia.org/wiki/Woodrow_Wilson): “As president, Wilson made significant economic reforms and led the United States through World War I.”
- Clue 2 — [Woodrow Wilson](https://en.wikipedia.org/wiki/Woodrow_Wilson): “The Senate finally approved it in June 1919, and the requisite number of states ratified the Nineteenth Amendment in August 1920. After the end of his second term in 1921, Wilson and his wife moved from the White House to a townhouse in the Kalorama section of Washington, D.C.”
-   ↳ — [Woodrow Wilson](https://en.wikipedia.org/wiki/Woodrow_Wilson): “In a 1918 speech before Congress, Wilson for the first time backed a national right to vote: "We have made partners of the women in this war....Shall we admit them only to a partnership of suffering and sacrifice and toil and not to a partnership of privilege and right?" The House passed a constitutional amendment providing for women's suffrage nationwide, but this stalled in the Senate.”
- Clue 3 — [Edith Wilson](https://en.wikipedia.org/wiki/Edith_Wilson): “For the remainder of her husband's presidency, she managed the office of the president, a role she later described as a "stewardship", and determined which communications and matters of state were important enough to bring to the attention of the bedridden president. Edith Bolling was born October 15, 1872, in Wytheville, Virginia, to circuit court judge William Holcombe Bolling and his wife Sarah "Sallie" Spears …”
- Clue 4 — [Woodrow Wilson](https://en.wikipedia.org/wiki/Woodrow_Wilson): “In 1886, Wilson was awarded a Ph.D. in history and government from Johns Hopkins University, making him the only U.S. president in the nation's history to possess a Ph.D.”

### Warren G. Harding
- Birthplace, town — [Warren G. Harding](https://en.wikipedia.org/wiki/Warren_G._Harding): “In the subsequent decades, some historians have begun to reassess Harding's record in office.  Warren Harding was born on November 2, 1865, in Blooming Grove, Ohio.”
- Clue 1 — [Warren G. Harding](https://en.wikipedia.org/wiki/Warren_G._Harding): “In 1923, he died of a heart attack in San Francisco while on a western tour, and was succeeded by Vice President Calvin Coolidge.”
- Clue 2 — [Warren G. Harding](https://en.wikipedia.org/wiki/Warren_G._Harding): “Teapot Dome involved an oil reserve in Wyoming which was one of three set aside for use by the Navy in a national emergency.”
- Clue 3 — [Warren G. Harding](https://en.wikipedia.org/wiki/Warren_G._Harding): “In 1923, he died of a heart attack in San Francisco while on a western tour, and was succeeded by Vice President Calvin Coolidge.”
- Clue 4 — [Warren G. Harding](https://en.wikipedia.org/wiki/Warren_G._Harding): “Cox in a landslide, becoming the first sitting senator to be elected president.”

### Calvin Coolidge
- Birthplace, town — [Calvin Coolidge](https://en.wikipedia.org/wiki/Calvin_Coolidge): “Scholars consistently have ranked Coolidge in the lower half of U.S. presidents, however, such surveys since the 21st century have ranked him more mediocrely rather than assessing him as a failure. John Calvin Coolidge Jr. was born on July 4, 1872, in Plymouth Notch, Vermont—the only U.S. president to be born on Independence Day.”
- Clue 1 — [Calvin Coolidge](https://en.wikipedia.org/wiki/Calvin_Coolidge): “Coolidge gained a reputation as a small-government conservative, with a taciturn personality and dry sense of humor that earned him the nickname "Silent Cal".”
- Clue 2 — [Calvin Coolidge](https://en.wikipedia.org/wiki/Calvin_Coolidge): “On June 2, 1924, Coolidge signed the act granting citizenship to all Native Americans born in the United States.”
- Clue 3 — [Calvin Coolidge](https://en.wikipedia.org/wiki/Calvin_Coolidge): “His father, a notary public and justice of the peace, administered the oath of office in the family's parlor by the light of a kerosene lamp at 2:47 a.m. on August 3, 1923, whereupon the new President of the United States returned to bed.”
- Clue 4 — [Calvin Coolidge](https://en.wikipedia.org/wiki/Calvin_Coolidge): “On December 6, 1923, his speech to Congress was broadcast on radio, the first presidential radio address.”
-   ↳ — [Calvin Coolidge](https://en.wikipedia.org/wiki/Calvin_Coolidge): “His second inauguration was the first presidential inauguration broadcast on radio.”

### Herbert Hoover
- Birthplace, town — [Herbert Hoover](https://en.wikipedia.org/wiki/Herbert_Hoover): “Assessments of his presidency by historians and political scientists generally rank him as amongst the worst American presidents due to his inability to stabilize the economy, despite his effectiveness as a humanitarian and administrator. Herbert Clark Hoover was born on August 10, 1874, in West Branch, Iowa.”
- Clue 1 — [Herbert Hoover](https://en.wikipedia.org/wiki/Herbert_Hoover): “Hoover's term as president was dominated by the Great Depression.”
- Clue 2 — [Herbert Hoover](https://en.wikipedia.org/wiki/Herbert_Hoover): “Hoover has been memorialized in the names of several things, including the Hoover Dam on the Colorado River and numerous elementary, middle, and high schools across the United States.”
- Clue 3 — [Herbert Hoover](https://en.wikipedia.org/wiki/Herbert_Hoover): “In 1914, during World War I, he organized and headed the Commission for Relief in Belgium, an international organization that provided food to occupied Belgium.”
- Clue 4 — [Herbert Hoover](https://en.wikipedia.org/wiki/Herbert_Hoover): “Hoover's mother died in 1884 of typhoid, leaving Hoover, his older brother, Theodore, and his younger sister, May, as orphans.”
-   ↳ — [Herbert Hoover](https://en.wikipedia.org/wiki/Herbert_Hoover): “In November 1885, Hoover was sent to Newberg, Oregon, to live with his uncle John Minthorn, a Quaker physician and businessman whose own son had died the year before.”

### Franklin D. Roosevelt
- Birthplace, town — [Franklin D. Roosevelt](https://en.wikipedia.org/wiki/Franklin_D._Roosevelt): “Nonetheless, historical rankings consistently place him among the three greatest American presidents. Franklin Delano Roosevelt was born on January 30, 1882, in Hyde Park, New York, to James Roosevelt I and his second wife, Sara Ann Delano.”
- Clue 1 — [Franklin D. Roosevelt](https://en.wikipedia.org/wiki/Franklin_D._Roosevelt): “He is the longest-serving US president and the only one to have served more than two terms.”
- Clue 2 — [Franklin D. Roosevelt](https://en.wikipedia.org/wiki/Franklin_D._Roosevelt): “Roosevelt called for war in his "Infamy Speech" to Congress, in which he said: "Yesterday, December 7, 1941—a date which will live in infamy—the United States of America was suddenly and deliberately attacked by naval and air forces of the Empire of Japan." In a nearly unanimous vote, Congress declared war on Japan.”
- Clue 3 — [Franklin D. Roosevelt](https://en.wikipedia.org/wiki/Franklin_D._Roosevelt): “Franklin then began courting his childhood acquaintance and fifth cousin once removed, Eleanor Roosevelt, a niece of Theodore Roosevelt.”
- Clue 4 — [Franklin D. Roosevelt](https://en.wikipedia.org/wiki/Franklin_D._Roosevelt): “Roosevelt's leadership in the March of Dimes is one reason he has been commemorated on the American dime coin since 1946.”
-   ↳ — [Franklin D. Roosevelt](https://en.wikipedia.org/wiki/Franklin_D._Roosevelt): “He was diagnosed with polio which left him permanently paralyzed from the waist down.”

### Harry S. Truman
- Birthplace, town — [Harry S. Truman](https://en.wikipedia.org/wiki/Harry_S._Truman): “Truman was born in Lamar, Missouri, on May 8, 1884, the oldest child of John Anderson Truman and Martha Ellen Young Truman.”
- Clue 1 — [Harry S. Truman](https://en.wikipedia.org/wiki/Harry_S._Truman): “Only then was he told about the ongoing Manhattan Project and the atomic bomb.”
- Clue 2 — [Harry S. Truman](https://en.wikipedia.org/wiki/Harry_S._Truman): “Truman authorized the first and only use of nuclear weapons in war against the Japanese cities of Hiroshima and Nagasaki.”
- Clue 3 — [Harry S. Truman](https://en.wikipedia.org/wiki/Harry_S._Truman): “The defining image of the campaign came after Election Day, when an ecstatic Truman held aloft the erroneous front page of the Chicago Tribune with a huge headline proclaiming "Dewey Defeats Truman." Truman's second inauguration on January 20, 1949, was the first ever televised nationally. The Soviet Union's atomic bomb project progressed much faster than had been expected, and they detonated their first bomb on A…”
- Clue 4 — [Harry S. Truman](https://en.wikipedia.org/wiki/Harry_S._Truman): “His middle initial, "S", is not an abbreviation of one particular name.”
-   ↳ — [Harry S. Truman](https://en.wikipedia.org/wiki/Harry_S._Truman): “Rather, it honors both his grandfathers, Anderson Shipp Truman and Solomon Young, a somewhat common practice in the American South at the time.”

### Dwight D. Eisenhower
- Birthplace, town — [Dwight D. Eisenhower](https://en.wikipedia.org/wiki/Dwight_D._Eisenhower): “Historical evaluations of his presidency place him among the upper tier of US presidents. On October 14, 1890 (1890-10-14), Eisenhower was born David Dwight Eisenhower in Denison, Texas, the third of seven sons born to Ida Stover and David Jacob Eisenhower.”
- Clue 1 — [Dwight D. Eisenhower](https://en.wikipedia.org/wiki/Dwight_D._Eisenhower): “The Germans made the already tough battle more difficult by adding 19 divisions and initially outnumbering the Allied forces 2 to 1. In December 1943, President Roosevelt decided that Eisenhower – not Marshall – would be Supreme Allied Commander in Europe.”
- Clue 2 — [Dwight D. Eisenhower](https://en.wikipedia.org/wiki/Dwight_D._Eisenhower): “His administration undertook the development and construction of the Interstate Highway System, which remains the largest construction of roadways in American history.”
- Clue 3 — [Dwight D. Eisenhower](https://en.wikipedia.org/wiki/Dwight_D._Eisenhower): “In July 1950, Eisenhower met then California congressman Richard Nixon for the first time when both men were guests of former president Herbert Hoover at a small group lunch party at the named Cave Man Camp, part of the 2,700-acre private campground the Bohemian Grove located 70 miles north of San Francisco, with Hoover having been a member of the Bohemian club since 1913.”
- Clue 4 — [Dwight D. Eisenhower](https://en.wikipedia.org/wiki/Dwight_D._Eisenhower): “He played golf frequently during and after his presidency and was unreserved in his passion for the game, to the point of golfing during winter; he ordered his golf balls painted black so he could see them better against snow.”

### John F. Kennedy
- Birthplace, town — [John F. Kennedy](https://en.wikipedia.org/wiki/John_F._Kennedy): “Kennedy is the most recent U.S. president to have died in office. John Fitzgerald Kennedy was born on May 29, 1917, outside Boston in Brookline, Massachusetts, to Joseph P.”
- Clue 1 — [John F. Kennedy](https://en.wikipedia.org/wiki/John_F._Kennedy): “Forty-three years old, Kennedy was the youngest person ever elected to the presidency (though Theodore Roosevelt was a year younger when he succeeded to the presidency after the assassination of William McKinley in 1901). Kennedy was sworn in as the 35th president at noon on January 20, 1961.”
- Clue 2 — [John F. Kennedy](https://en.wikipedia.org/wiki/John_F._Kennedy): “He presided over the establishment of the Peace Corps, Alliance for Progress with Latin America, and the continuation of the Apollo program with the goal of landing a man on the Moon before 1970.”
- Clue 3 — [John F. Kennedy](https://en.wikipedia.org/wiki/John_F._Kennedy): “An estimated 70 million Americans, about two-thirds of the electorate, watched the first debate on September 26.”
- Clue 4 — [John F. Kennedy](https://en.wikipedia.org/wiki/John_F._Kennedy): “During his convalescence in 1956, he published Profiles in Courage, a book about U.S. senators who risked their careers for their personal beliefs, for which he won the Pulitzer Prize for Biography in 1957.”

### Lyndon B. Johnson
- Birthplace, town — [Lyndon B. Johnson](https://en.wikipedia.org/wiki/Lyndon_B._Johnson): “Conversely, Johnson is heavily criticized for his foreign policy, namely escalating American involvement in the Vietnam War. Lyndon Baines Johnson was born on August 27, 1908, near Stonewall, Texas, in a small farmhouse on the Pedernales River.”
- Clue 1 — [Lyndon B. Johnson](https://en.wikipedia.org/wiki/Lyndon_B._Johnson): “Later that day, Johnson took the presidential oath of office aboard Air Force One.”
- Clue 2 — [Lyndon B. Johnson](https://en.wikipedia.org/wiki/Lyndon_B._Johnson): “Johnson signed the Civil Rights Act of 1964 into law on July 2.”
- Clue 3 — [Lyndon B. Johnson](https://en.wikipedia.org/wiki/Lyndon_B._Johnson): “In 1965, First Lady Lady Bird Johnson took the lead in calling for passage of the Highway Beautification Act.”
- Clue 4 — [Lyndon B. Johnson](https://en.wikipedia.org/wiki/Lyndon_B._Johnson): “Johnson gave his children names with the LBJ initials as a family tradition; his dog was named Little Beagle Johnson, and his home was the LBJ Ranch in the Texas Hill Country.”

### Richard Nixon
- Birthplace, town — [Richard Nixon](https://en.wikipedia.org/wiki/Richard_Nixon): “On April 18, 1994, he suffered a debilitating stroke and died four days later. Richard Milhous Nixon was born on January 9, 1913, in what was then the township precinct of Yorba Linda, California, in a house built by his father, on his family's lemon ranch.”
- Clue 1 — [Richard Nixon](https://en.wikipedia.org/wiki/Richard_Nixon): “Nixon's second term ended early when he became the only U.S. president to resign from office, as a part of the Watergate scandal.”
- Clue 2 — [Apollo 11](https://en.wikipedia.org/wiki/Apollo_11): “Before Aldrin could take a photo of Armstrong with the flag, President Richard Nixon spoke to them through a telephone-radio transmission, which Nixon called "the most historic phone call ever made from the White House." Nixon originally had a long speech prepared to read during the phone call, but Frank Borman, who was at the White House as a NASA liaison during Apollo 11, convinced Nixon to keep his words brief.”
- Clue 3 — [Richard Nixon](https://en.wikipedia.org/wiki/Richard_Nixon): “Nixon and Kissinger immediately met for an hour with CCP Chairman Mao Zedong and Premier Zhou at Mao's official private residence, where they discussed a range of issues.”
- Clue 4 — [Richard Nixon](https://en.wikipedia.org/wiki/Richard_Nixon): “During the course of his first term, he enacted many progressive environmental policy shifts, such as creating the Environmental Protection Agency and passing laws, including the Endangered Species and Clean Air Acts.”

### Gerald Ford
- Birthplace, town — [Gerald Ford](https://en.wikipedia.org/wiki/Gerald_Ford): “Surveys of historians and political scientists have ranked Ford as a below-average president, though retrospective public polls on his time in office were more positive. Ford was born Leslie Lynch King Jr. on July 14, 1913, at 3202 Woolworth Avenue in Omaha, Nebraska, where his parents lived with his paternal grandparents.”
-   ↳ — [Gerald Ford](https://en.wikipedia.org/wiki/Gerald_Ford): “Though never formally adopted, her young son was referred to as Gerald Rudolff Ford Jr. from then on; the name change, including the anglicized spelling "Rudolph", was formalized on December 3, 1935.”
- Clue 1 — [Gerald Ford](https://en.wikipedia.org/wiki/Gerald_Ford): “This made him the only person to become the nation's chief executive without being elected to the presidency or the vice presidency.”
- Clue 2 — [Gerald Ford](https://en.wikipedia.org/wiki/Gerald_Ford): “Some, including Barry Goldwater, voted against him. On September 8, 1974, Ford issued Proclamation 4311, which gave Nixon a full and unconditional pardon for any crimes he might have committed against the United States while president.”
- Clue 3 — [Gerald Ford](https://en.wikipedia.org/wiki/Gerald_Ford): “Ford attended the University of Michigan, where he played center and linebacker for the school's football team and helped the Wolverines to two undefeated seasons and national titles in 1932 and 1933.”
- Clue 4 — [Gerald Ford](https://en.wikipedia.org/wiki/Gerald_Ford): “Gerald Rudolph Ford Jr. (born Leslie Lynch King Jr.; July 14, 1913 – December 26, 2006) was the 38th president of the United States, serving from 1974 to 1977.”

### Jimmy Carter
- Birthplace, town — [Jimmy Carter](https://en.wikipedia.org/wiki/Jimmy_Carter): “Carter was the first U.S. president born in a hospital.”
- Clue 1 — [Jimmy Carter](https://en.wikipedia.org/wiki/Jimmy_Carter): “His plans changed when his father died of pancreatic cancer in July, two months before construction of Seawolf began, and Carter obtained a release from active duty so he could take over the family peanut business.”
- Clue 2 — [Jimmy Carter](https://en.wikipedia.org/wiki/Jimmy_Carter): “After a failed attempt to seek a comprehensive settlement in 1977 (through reconvening the 1973 Geneva conference), Carter invited the Egyptian president Anwar Sadat and Israeli prime minister Menachem Begin to the presidential lodge Camp David in September 1978, in hopes of creating a definitive peace.”
- Clue 3 — [Jimmy Carter](https://en.wikipedia.org/wiki/Jimmy_Carter): “Carter was a longtime volunteer with Habitat for Humanity.”
- Clue 4 — [Jimmy Carter](https://en.wikipedia.org/wiki/Jimmy_Carter): “He lived longer than any other president in U.S. history, reaching age 100.”

### Ronald Reagan
- Birthplace, town — [Ronald Reagan](https://en.wikipedia.org/wiki/Ronald_Reagan): “Historical rankings of US presidents have typically placed Reagan in the middle to upper tier, and his post-presidential approval ratings by the general public have generally remained high. Ronald Wilson Reagan was born on February 6, 1911, in an apartment in Tampico, Illinois, the younger son of Nelle Clyde Wilson and Jack Reagan.”
- Clue 1 — [Ronald Reagan](https://en.wikipedia.org/wiki/Ronald_Reagan): “Using a simple and direct approach to acting and following his directors' instructions, he made thirty films, mostly B films, before beginning military service in April 1942.”
- Clue 2 — [Ronald Reagan](https://en.wikipedia.org/wiki/Ronald_Reagan): “In June 1987, Reagan addressed Gorbachev during a speech at the Berlin Wall, demanding that he "tear down this wall".”
- Clue 3 — [Ronald Reagan](https://en.wikipedia.org/wiki/Ronald_Reagan): “Nancy Reagan founded the "Just Say No" campaign to discourage others from engaging in recreational drug use and raise awareness about the dangers of drugs.”
- Clue 4 — [Ronald Reagan](https://en.wikipedia.org/wiki/Ronald_Reagan): “He then worked for WHO radio in Des Moines as a broadcaster for the Chicago Cubs.”

### George H. W. Bush
- Birthplace, town — [George H. W. Bush](https://en.wikipedia.org/wiki/George_H._W._Bush): “Historians generally rank Bush as an above-average president. George Herbert Walker Bush was born on June 12, 1924, in Milton, Massachusetts.”
-   ↳ — [George H. W. Bush](https://en.wikipedia.org/wiki/George_H._W._Bush): “Born into the prominent and wealthy Bush family in Milton, Massachusetts, Bush was raised in Greenwich, Connecticut, and attended Phillips Academy in Andover, Massachusetts.”
- Clue 1 — [George H. W. Bush](https://en.wikipedia.org/wiki/George_H._W._Bush): “After Iraq invaded Kuwait in August 1990, Bush imposed economic sanctions on Iraq and assembled a multi-national coalition opposed to the invasion.”
- Clue 2 — [George W. Bush](https://en.wikipedia.org/wiki/George_W._Bush): “He is the first child of George Herbert Walker Bush and Barbara Pierce, and was raised in Midland and Houston, Texas.”
- Clue 3 — [George H. W. Bush](https://en.wikipedia.org/wiki/George_H._W._Bush): “He became the fourth sitting vice president to be elected president and the first to do so since Martin Van Buren in 1836 and the first person to succeed a president from his own party via election since Herbert Hoover in 1929.”
- Clue 4 — [Post-presidency of George H. W. Bush](https://en.wikipedia.org/wiki/Post-presidency_of_George_H._W._Bush): “On June 12, 2014, Bush fulfilled a long-standing promise by skydiving on his 90th birthday.”

### Bill Clinton
- Birthplace, town — [Bill Clinton](https://en.wikipedia.org/wiki/Bill_Clinton): “Following Jimmy Carter's death in December 2024, he is the earliest-serving living former U.S. president and the last surviving president to have served in the 20th century. Clinton was born as William Jefferson Blythe III on August 19, 1946, at the Julia Chester Hospital in Hope, Arkansas.”
-   ↳ — [Bill Clinton](https://en.wikipedia.org/wiki/Bill_Clinton): “Although he immediately assumed use of his stepfather's surname, it was not until Clinton turned 15 that he formally adopted the surname Clinton as a gesture toward him.”
- Clue 1 — [Bill Clinton](https://en.wikipedia.org/wiki/Bill_Clinton): “When Clinton played the saxophone on The Arsenio Hall Show, he was described by some religious conservatives as "the MTV president".”
- Clue 2 — [Bill Clinton](https://en.wikipedia.org/wiki/Bill_Clinton): “During the last three years of Clinton's presidency, the Congressional Budget Office reported a budget surplus—the first and only such surplus since 1969.”
- Clue 3 — [Hillary Clinton](https://en.wikipedia.org/wiki/Hillary_Clinton): “Clinton won the popular vote but lost the election to Republican Party nominee Donald Trump in the United States Electoral College.”
- Clue 4 — [Bill Clinton](https://en.wikipedia.org/wiki/Bill_Clinton): “One was his visit as a Boys Nation senator to the White House to meet President John F.”

### George W. Bush
- Birthplace, town — [George W. Bush](https://en.wikipedia.org/wiki/George_W._Bush): “Scholars and historians generally rank Bush as a below-average president. George Walker Bush was born on July 6, 1946, at Grace-New Haven Hospital in New Haven, Connecticut.”
- Clue 1 — [September 11 attacks](https://en.wikipedia.org/wiki/September_11_attacks): “The attacks killed 2,977 people, injured thousands more, and gave rise to long-term health consequences while causing at least US$10 billion in infrastructure and property damage.”
-   ↳ — [George W. Bush](https://en.wikipedia.org/wiki/George_W._Bush): “The September 11 attacks during 2001 decisively reshaped his administration, resulting in the start of the war on terror and the creation of the Department of Homeland Security.”
- Clue 2 — [George W. Bush](https://en.wikipedia.org/wiki/George_W._Bush): “In his first term, Bush signed a major tax-cut program and an education-reform bill, the No Child Left Behind Act.”
- Clue 3 — [George W. Bush](https://en.wikipedia.org/wiki/George_W._Bush): “He is the first child of George Herbert Walker Bush and Barbara Pierce, and was raised in Midland and Houston, Texas.”
- Clue 4 — [George W. Bush](https://en.wikipedia.org/wiki/George_W._Bush): “He later co-owned the Major League Baseball team Texas Rangers before being elected governor of Texas in 1994.”

### Barack Obama
- Birthplace, town — [Barack Obama](https://en.wikipedia.org/wiki/Barack_Obama): “As of 2026, he is the youngest-living former U.S. president. Barack Hussein Obama II was born on August 4, 1961, at Kapiolani Medical Center for Women and Children in Honolulu, Hawaii.”
- Clue 1 — [Barack Obama](https://en.wikipedia.org/wiki/Barack_Obama): “A member of the Democratic Party, he was the first African American  to serve as president.”
- Clue 2 — [Barack Obama](https://en.wikipedia.org/wiki/Barack_Obama): “In his second term, Obama advocated for gun control in the wake of the Sandy Hook Elementary School shooting, took steps to combat climate change by signing the Paris Agreement on climate change and an executive order to limit carbon emissions, and presided over the implementation of the Affordable Care Act and other legislation passed during his first term.”
- Clue 3 — [Barack Obama](https://en.wikipedia.org/wiki/Barack_Obama): “Obama selected Joe Biden as his running mate and defeated Republican nominee John McCain and his running mate Sarah Palin.”
- Clue 4 — [Early life and career of Barack Obama](https://en.wikipedia.org/wiki/Early_life_and_career_of_Barack_Obama): “Two years later, Dunham took Obama with her to Indonesia to reunite him with his stepfather.”
-   ↳ — [Early life and career of Barack Obama](https://en.wikipedia.org/wiki/Early_life_and_career_of_Barack_Obama): “In 1971, Obama returned to Honolulu to attend Punahou School, from which he graduated in 1979.”

### Joe Biden
- Birthplace, town — [Joe Biden](https://en.wikipedia.org/wiki/Joe_Biden): “Mary's Hospital in Scranton, Pennsylvania, to Catherine Eugenia "Jean" Biden (née Finnegan) and Joseph Robinette Biden Sr.”
-   ↳ — [Joe Biden](https://en.wikipedia.org/wiki/Joe_Biden): “Beginning in 1953, when Biden was ten, the family lived in an apartment in Claymont, Delaware, before moving to a house in nearby Mayfield, Delaware.”
- Clue 1 — [Barack Obama](https://en.wikipedia.org/wiki/Barack_Obama): “Obama selected Joe Biden as his running mate and defeated Republican nominee John McCain and his running mate Sarah Palin.”
- Clue 2 — [Joe Biden](https://en.wikipedia.org/wiki/Joe_Biden): “Biden signed numerous major pieces of economic legislation in the 117th Congress, including the American Rescue Plan, Infrastructure Investment and Jobs Act, CHIPS and Science Act, and the Inflation Reduction Act.”
- Clue 3 — [Joe Biden](https://en.wikipedia.org/wiki/Joe_Biden): “In the 2020 presidential election, Biden chose Kamala Harris as his running mate, and they defeated Republican incumbents Donald Trump and Mike Pence.”
- Clue 4 — [Joe Biden](https://en.wikipedia.org/wiki/Joe_Biden): “For 36 years, he commuted from Washington to Wilmington via Amtrak, earning him the nickname "Amtrak Joe". During his early years in the Senate, Biden focused on consumer protection and environmental issues and called for greater government accountability.”

### Donald Trump
- Birthplace, town — [Donald Trump](https://en.wikipedia.org/wiki/Donald_Trump): “After his first term, scholars and historians ranked him as one of the worst presidents in American history. Donald John Trump was born on June 14, 1946, at Jamaica Hospital in the New York City borough of Queens, the fourth child of Fred Trump and Mary Anne MacLeod Trump.”
- Clue 1 — [Donald Trump](https://en.wikipedia.org/wiki/Donald_Trump): “He became the oldest to assume the presidency, the first president with a felony conviction, and the second to serve two nonconsecutive terms.”
- Clue 2 — [United States Space Force](https://en.wikipedia.org/wiki/United_States_Space_Force): “Space Force was established as the sixth armed service, meeting the Rumsfeld and Allard commissions' recommendations to create a Space Corps within the Department of the Air Force, but still falling short of creating a separate Department of the Space Force. We are at the dawn of a new era for our Nation’s Armed Forces.”
- Clue 3 — [JD Vance](https://en.wikipedia.org/wiki/JD_Vance): “Vance was selected as Trump's running mate in the 2024 presidential election and resigned from the Senate before his inauguration as vice president.”
-   ↳ — [Donald Trump](https://en.wikipedia.org/wiki/Donald_Trump): “Trump repeatedly sought help to overturn the results, personally pressuring Republican local and state office-holders, Republican legislators, the Justice Department, and Vice President Pence, urging actions such as replacing presidential electors, or that Georgia officials "find" votes and announce a "recalculated" result.”
- Clue 4 — [Donald Trump](https://en.wikipedia.org/wiki/Donald_Trump): “He became the oldest to assume the presidency, the first president with a felony conviction, and the second to serve two nonconsecutive terms.”
-   ↳ — [Donald Trump](https://en.wikipedia.org/wiki/Donald_Trump): “From 2004 to 2015, he hosted the reality television show The Apprentice, bolstering his reputation as a wealthy tycoon.”

## State cards

- [Virginia](https://en.wikipedia.org/wiki/Virginia): “Virginia has also been called the "Mother of Presidents", as eight Virginians have served as President of the United States, including four of the first five.”
- [Ohio](https://en.wikipedia.org/wiki/Ohio): “It is also known as the "Mother of Presidents", having been the birthplace of seven U.S. presidents, and the "Birthplace of Aviation", as the Wright brothers designed and built the world's first successful airplane in Ohio before its first flight in North Carolina.  Archeological evidence of spear points of both the Folsom and Clovis types indicate that the Ohio Valley was inhabited by nomadic people as early as 1…”
