<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Carbon\Carbon;

class DailyPrayerChain
{
    public static function getCurrentSession(): string
    {
        $now = Carbon::now();

        if ($now->between(Carbon::createFromTime(1, 0), Carbon::createFromTime(11, 59, 59))) {
            return 'morning';
        }

        if ($now->between(Carbon::createFromTime(12, 0), Carbon::createFromTime(16, 59, 59))) {
            return 'afternoon';
        }

        return 'evening'; // 5 PM onward
    }

    public static function getPrayersForSession(): array
    {
        $session = static::getCurrentSession();
        $prayers = static::prayers();
        $result = [];

        foreach ($prayers as $category => $sessions) {
            if (isset($sessions[$session])) {
                $prayer = collect($sessions[$session])->random();
                $result[] = [
                    'category' => ucfirst($category),
                    'session' => ucfirst($session),
                    'title' => $prayer['title'] ?? null,
                    'scripture' => $prayer['scripture'] ?? null,
                    'decree' => $prayer['decree'] ?? null,
                    'prayer' => $prayer['prayer'] ?? null,
                ];
            }
        }

        return $result;
    }

    public static function prayers(): Collection
    {
        return collect([
            'open doors' => [
                'morning' => [
                    [
                        'title' => 'Deuteronomy 8:18 Declaration',
                        'scripture' => 'It is the Lord who gives me power to get wealth!',
                        'decree' => 'Divine empowerment for wealth is operational in my life! I function under supernatural enablement to create, attract, and multiply wealth!',
                    ],
                    [
                        'title' => 'Psalm 1:3 Declaration',
                        'scripture' => 'Whatever I do prospers by divine rooting!',
                        'decree' => 'I am planted by the rivers of abundance! Every venture, every business, every project bears fruit in its season without fail!',
                    ],
                    [
                        'title' => 'Isaiah 48:17 Declaration',
                        'scripture' => 'The Lord is teaching me to profit and leading me in the way I should go!',
                        'decree' => 'I cannot be stranded! I am daily directed into profitable paths, contracts, deals, and opportunities!',
                    ],
                    [
                        'title' => 'Proverbs 22:29 Declaration',
                        'scripture' => 'I stand before kings and not obscure men!',
                        'decree' => 'My work is excellent and distinguished! Visibility, recommendation, and honor are my portion!',
                    ],
                    [
                        'title' => 'Malachi 3:10 Declaration',
                        'scripture' => 'The windows of heaven are opened over me!',
                        'decree' => 'Overflow, abundance, and divine supply answer to me perpetually because I am a faithful covenant practitioner!',
                    ],
                    [
                        'title' => 'Deuteronomy 28:12 Declaration',
                        'scripture' => 'The Lord blesses all the works of my hands!',
                        'decree' => 'My businesses, investments, farming, and career flourish by supernatural rain! I lend to nations; I borrow from none!',
                    ],
                ],

                'afternoon' => [
                    [
                        'title' => 'Warfare Prayer 1',
                        'prayer' => 'Father, by the covenant of wealth, I dismantle every altar of poverty, stagnation, and financial limitation programmed against the works of my hands — CATCH FIRE NOW!',
                    ],
                    [
                        'title' => 'Warfare Prayer 2',
                        'prayer' => 'O Lord, baptize the works of my hands with divine favor! Let helpers of destiny, strategic partners, and divine advertisers locate my ventures in Jesus\' Name!',
                    ],
                    [
                        'title' => 'Warfare Prayer 3',
                        'prayer' => 'Father, teach me by Your Spirit secrets of innovation, expansion, and multiplication! I reject every error, foolishness, and waste in my businesses and investments!',
                    ],
                    [
                        'title' => 'Warfare Prayer 4',
                        'prayer' => 'Every satanic embargo on my financial life, my business growth, my career advancement — I tear you down by fire! Let my heavens open without delay!',
                    ],
                    [
                        'title' => 'Warfare Prayer 5',
                        'prayer' => 'Lord, make me a symbol of covenant prosperity! Cause my life to provoke jealousy and inquiry among nations for Your glory!',
                    ],
                ],

                'evening' => [
                    [
                        'title' => 'Gratitude Prayer 1',
                        'prayer' => 'Father, thank You for blessing the works of my hands today! Thank You for commanding increase, favor, and open doors!',
                    ],
                    [
                        'title' => 'Gratitude Prayer 2',
                        'prayer' => 'Lord, I thank You for supernatural ideas, profitable directions, and strategic connections released today! My profiting is evident to all!',
                    ],
                    [
                        'title' => 'Gratitude Prayer 3',
                        'prayer' => 'I thank You, Abba Father, because the devourer is rebuked for my sake! No loss, no scarcity, no dryness — only surplus and supernatural supplies!',
                    ],
                    [
                        'title' => 'Prophetic Sealing',
                        'prayer' => 'By the Blood of Jesus, I seal every prayer, every declaration, every breakthrough of today! I decree that the testimonies are irreversible and multiplied in Jesus\' mighty Name! Amen!',
                    ],
                ],
            ],

            'gift of children' => [
                'morning' => [
                    [
                        'title' => 'Psalm 127:3 Declaration',
                        'scripture' => 'Behold, children are a heritage from the Lord, the fruit of the womb is His reward!',
                        'decree' => 'My children are the Lord’s gift! I receive them by divine inheritance! My womb/family is open and fruitful in Jesus\' Name!',
                    ],
                    [
                        'title' => 'Genesis 1:28 Declaration',
                        'scripture' => 'God blessed them, and God said to them, \'Be fruitful and multiply...\'',
                        'decree' => 'I am fruitful! I multiply! Barrenness has no place in my lineage! Fruitfulness is my covenant reality!',
                    ],
                    [
                        'title' => 'Exodus 23:26 Declaration',
                        'scripture' => 'None shall miscarry or be barren in your land; I will fulfill the number of your days!',
                        'decree' => 'Barrenness and miscarriage are forbidden in my household! My family enjoys full cycles of conception, preservation, and delivery!',
                    ],
                    [
                        'title' => 'Deuteronomy 7:14 Declaration',
                        'scripture' => 'You shall be blessed above all peoples; there shall not be a male or female barren among you...',
                        'decree' => 'We are blessed above all nations! Barrenness is banished forever! Fruitfulness is established in my home and destiny!',
                    ],
                    [
                        'title' => 'Isaiah 54:1 Declaration',
                        'scripture' => 'Sing, O barren, you who have not borne! Break forth into singing and cry aloud...For more are the children of the desolate...',
                        'decree' => 'I break forth into singing! My joy overflows! I shall carry my miracle children to full manifestation! My testimony shall shock my generation!',
                    ],
                ],

                'afternoon' => [
                    [
                        'title' => 'Warfare Prayer 1',
                        'prayer' => 'Father, by the Blood of Jesus, I uproot every root of barrenness, delay, and disappointment! Every evil seed sown into my womb/family — dry up by fire now!',
                    ],
                    [
                        'title' => 'Warfare Prayer 2',
                        'prayer' => 'O Lord, breathe Your creative breath upon my body, my spouse’s body, and our reproductive systems! Every organ functions perfectly by divine command!',
                    ],
                    [
                        'title' => 'Warfare Prayer 3',
                        'prayer' => 'Father, release Your warrior angels to war against every ancient covenant, curse, or pronouncement of unfruitfulness in my lineage — let them be shattered NOW in Jesus\' Name!',
                    ],
                    [
                        'title' => 'Warfare Prayer 4',
                        'prayer' => 'I reject medical verdicts, negative reports, and satanic imaginations! I decree: Only the report of the Lord shall stand — the report of fruitfulness, conception, and safe delivery!',
                    ],
                    [
                        'title' => 'Warfare Prayer 5',
                        'prayer' => 'Lord, as You remembered Hannah, Sarah, Elizabeth, and Rachel — remember me today! Let my story be rewritten into joy and celebration in the name of Jesus!',
                    ],
                ],

                'evening' => [
                    [
                        'title' => 'Gratitude Prayer 1',
                        'prayer' => 'Father, thank You because children are a heritage, and You have already blessed me with my own! I see them by faith! I call them forth by Your Word!',
                    ],
                    [
                        'title' => 'Gratitude Prayer 2',
                        'prayer' => 'Thank You Lord for opening every gate and door necessary for conception and preservation! Thank You for overturning every delay into a miracle!',
                    ],
                    [
                        'title' => 'Gratitude Prayer 3',
                        'prayer' => 'Thank You because Your Word says "none shall be barren" — and Your Word never returns void! My testimony is sealed by thanksgiving!',
                    ],
                    [
                        'title' => 'Prophetic Sealing',
                        'prayer' => 'By the Blood of Jesus, I seal my womb, my body, my home, and my miracle children! I decree: NO REVERSE, NO DELAY, NO DENIAL! It is done! It is established! It is manifested in Jesus\' mighty Name! Amen and Amen!',
                    ],
                ],
            ],

            'wisdom & leadership' => [
                'morning' => [
                    [
                        'title' => 'James 1:5 Declaration',
                        'scripture' => 'If any of you lacks wisdom, let him ask of God, who gives to all liberally and without reproach, and it will be given to him.',
                        'decree' => 'I walk in divine wisdom! Wisdom flows in me, flows through me, and flows for me! I receive liberally from the Fountain of all wisdom today!',
                    ],
                    [
                        'title' => 'Proverbs 4:7 Declaration',
                        'scripture' => 'Wisdom is the principal thing; therefore get wisdom. And in all your getting, get understanding.',
                        'decree' => 'I prioritize wisdom! I attract sound judgment, deep insight, and supernatural intelligence! I function by higher understanding!',
                    ],
                    [
                        'title' => 'Ecclesiastes 10:10 Declaration',
                        'scripture' => 'Wisdom is profitable to direct.',
                        'decree' => 'I do not make foolish moves! I am divinely directed in leadership, in decision-making, and in managing people and resources!',
                    ],
                    [
                        'title' => 'Isaiah 11:2 Declaration',
                        'scripture' => 'The Spirit of the Lord shall rest upon Him — the Spirit of wisdom and understanding, the Spirit of counsel and might, the Spirit of knowledge and of the fear of the Lord.',
                        'decree' => 'The Spirit of wisdom, maturity, counsel, might, and excellence rests heavily on me now! I lead with divine might!',
                    ],
                    [
                        'title' => 'Psalm 78:72 Declaration',
                        'scripture' => 'So he shepherded them according to the integrity of his heart, and guided them by the skillfulness of his hands.',
                        'decree' => 'I lead with integrity! I guide my home, my team, and my world by the skillfulness born of wisdom and divine understanding!',
                    ],
                ],

                'afternoon' => [
                    [
                        'title' => 'Warfare Prayer 1',
                        'prayer' => 'Father, baptize me afresh with the Spirit of wisdom and revelation! Let every veil of confusion, immaturity, and error be torn off my mind and soul — NOW, in Jesus’ Name!',
                    ],
                    [
                        'title' => 'Warfare Prayer 2',
                        'prayer' => 'O Lord, sharpen my discernment! Grant me uncommon understanding to know what to do, how to do it, and when to do it — without missing my steps!',
                    ],
                    [
                        'title' => 'Warfare Prayer 3',
                        'prayer' => 'I come against the spirit of foolishness, spiritual blindness, and leadership error! I decree: I shall not fall by the enemy’s trap of poor decision-making!',
                    ],
                    [
                        'title' => 'Warfare Prayer 4',
                        'prayer' => 'Father, empower me with divine competence, excellence, patience, and boldness to lead my home, my family, my team, and my generation without fear or failure!',
                    ],
                    [
                        'title' => 'Warfare Prayer 5',
                        'prayer' => 'Lord, let my life be a channel of wisdom to others! Make me a leader of leaders, a torchbearer of knowledge, and a standard for others to follow!',
                    ],
                ],

                'evening' => [
                    [
                        'title' => 'Gratitude Prayer 1',
                        'prayer' => 'Father, thank You for clothing me with wisdom, with maturity, and with leadership grace beyond my natural capacity!',
                    ],
                    [
                        'title' => 'Gratitude Prayer 2',
                        'prayer' => 'Thank You, Lord, for daily guiding me with Your eye, counseling me with Your Word, and empowering me to navigate life accurately!',
                    ],
                    [
                        'title' => 'Gratitude Prayer 3',
                        'prayer' => 'Thank You for lifting me into strategic positions of leadership, influence, and honor! I celebrate Your investment of wisdom in my life!',
                    ],
                    [
                        'title' => 'Prophetic Sealing',
                        'prayer' => 'By the Blood of Jesus, I seal every impartation of wisdom, leadership, and excellence received today! I decree: I shall walk, live, and lead by wisdom all the days of my life without shame, stagnation, or downfall! In Jesus\' mighty Name, Amen!',
                    ],
                ],
            ],

            'growth in marriage' => [
                'morning' => [
                    [
                        'title' => 'Ecclesiastes 4:9-10 Declaration',
                        'scripture' => 'Two are better than one, because they have a good reward for their labor. For if they fall, one will lift up his companion.',
                        'decree' => 'Our union is a covenant of advantage! Together, we achieve supernatural success and lift one another higher without fail!',
                    ],
                    [
                        'title' => '1 Corinthians 13:4-7 Declaration',
                        'scripture' => 'Love suffers long and is kind; love does not envy; love does not parade itself, is not puffed up...endures all things.',
                        'decree' => 'Our marriage is rooted in patient, selfless love! Envy, pride, and selfishness have no place between us!',
                    ],
                    [
                        'title' => 'Colossians 3:13-14 Declaration',
                        'scripture' => 'Bearing with one another, and forgiving one another...But above all these things put on love, which is the bond of perfection.',
                        'decree' => 'The garment of tolerance and forgiveness covers our hearts! Love binds us in perfect unity and strength!',
                    ],
                    [
                        'title' => 'Philippians 4:7 Declaration',
                        'scripture' => 'And the peace of God, which surpasses all understanding, will guard your hearts and minds through Christ Jesus.',
                        'decree' => 'The peace of God reigns over our home! Every storm, every unrest, every tension is silenced by divine peace!',
                    ],
                    [
                        'title' => 'Proverbs 18:22 Declaration',
                        'scripture' => 'He who finds a wife finds a good thing, and obtains favor from the Lord.',
                        'decree' => 'Our marriage is a channel of unstoppable favor! Success, laughter, and abundant blessings flow endlessly into our lives!',
                    ],
                ],

                'afternoon' => [
                    [
                        'title' => 'Warfare Prayer 1',
                        'prayer' => 'Father, every arrow of misunderstanding, bitterness, and division fired against our marriage — backfire by the fire of the Holy Ghost NOW!',
                    ],
                    [
                        'title' => 'Warfare Prayer 2',
                        'prayer' => 'O Lord, raise a wall of fire around our union! Let no third-party, no evil agenda, no wicked influence penetrate the bond You have established!',
                    ],
                    [
                        'title' => 'Warfare Prayer 3',
                        'prayer' => 'Father, empower us with the spirit of patience, mutual respect, emotional maturity, and sacrificial love! Let strife and anger die at their roots!',
                    ],
                    [
                        'title' => 'Warfare Prayer 4',
                        'prayer' => 'Lord, uproot every seed of offense, resentment, or unforgiveness before they take root! We walk in continual forgiveness, empathy, and understanding!',
                    ],
                    [
                        'title' => 'Warfare Prayer 5',
                        'prayer' => 'I decree marital growth: spiritually, emotionally, financially, and relationally! Every day, our home shall be stronger, better, sweeter, and more glorious by divine design!',
                    ],
                ],

                'evening' => [
                    [
                        'title' => 'Gratitude Prayer 1',
                        'prayer' => 'Father, thank You for building our marriage upon the solid Rock — unshakable, unstoppable, and unbreakable!',
                    ],
                    [
                        'title' => 'Gratitude Prayer 2',
                        'prayer' => 'Thank You for daily flooding our hearts with fresh love, fresh wisdom, fresh laughter, and fresh grace!',
                    ],
                    [
                        'title' => 'Gratitude Prayer 3',
                        'prayer' => 'Thank You because our marriage is a testimony to others: a model of peace, happiness, growth, and God-centered success!',
                    ],
                    [
                        'title' => 'Prophetic Sealing',
                        'prayer' => 'By the Blood of Jesus, I seal our union in divine love, divine understanding, divine fruitfulness, and supernatural prosperity! I decree: No plan of hell can fracture what God has joined! Our marriage is ever flourishing, ever increasing, and ever victorious in Jesus\' mighty Name! Amen and Amen!',
                    ],
                ],
            ],

            'health & longevity' => [
                'morning' => [
                    [
                        'title' => 'Exodus 23:25 Declaration',
                        'scripture' => 'So you shall serve the Lord your God, and He will bless your bread and your water. And I will take sickness away from the midst of you.',
                        'decree' => 'Our bread and water are blessed! No sickness, disease, or affliction is permitted around us! Divine health flows in our bodies!',
                    ],
                    [
                        'title' => '3 John 1:2 Declaration',
                        'scripture' => 'Beloved, I pray that you may prosper in all things and be in health, just as your soul prospers.',
                        'decree' => 'As our souls prosper in God, our bodies are energized with divine vitality! We prosper in health, strength, and wellness!',
                    ],
                    [
                        'title' => 'Psalm 91:16 Declaration',
                        'scripture' => 'With long life I will satisfy him, and show him My salvation.',
                        'decree' => 'We shall not die prematurely! We are satisfied with long life — fruitful, healthy, impactful, and joyful lives!',
                    ],
                    [
                        'title' => 'Isaiah 53:5 Declaration',
                        'scripture' => 'But He was wounded for our transgressions, He was bruised for our iniquities; the chastisement for our peace was upon Him, and by His stripes we are healed.',
                        'decree' => 'By the stripes of Jesus, we are healed — spirit, soul, and body! No inherited disease, no strange affliction can prevail!',
                    ],
                    [
                        'title' => 'Proverbs 3:7-8 Declaration',
                        'scripture' => 'Fear the Lord and depart from evil. It will be health to your flesh, and strength to your bones.',
                        'decree' => 'We fear the Lord; therefore, divine strength floods our flesh and bones! No weakness, no decay, no sudden collapse!',
                    ],
                ],

                'afternoon' => [
                    [
                        'title' => 'Warfare Prayer 1',
                        'prayer' => 'Father, every satanic agenda of sickness, sudden death, terminal disease, or hereditary affliction — I cancel you by fire NOW in Jesus’ Name!',
                    ],
                    [
                        'title' => 'Warfare Prayer 2',
                        'prayer' => 'O Lord, let the Blood of Jesus flush out every hidden infirmity, contamination, or weakness in our bodies and the bodies of our loved ones!',
                    ],
                    [
                        'title' => 'Warfare Prayer 3',
                        'prayer' => 'Every covenant of early death, every altar of tragedy raised against our destinies — be shattered by the thunder of God!',
                    ],
                    [
                        'title' => 'Warfare Prayer 4',
                        'prayer' => 'Father, protect our unborn children, our seed, and our generations with the wall of fire! No demonic exchange, no evil complication, no satanic harassment shall prosper!',
                    ],
                    [
                        'title' => 'Warfare Prayer 5',
                        'prayer' => 'I decree: Sound mind, strong heart, healthy organs, agile body, and vibrant spirit are our portion — today and forevermore!',
                    ],
                ],

                'evening' => [
                    [
                        'title' => 'Gratitude Prayer 1',
                        'prayer' => 'Father, thank You for Your covenant of divine health that speaks for me, my family, and our generations!',
                    ],
                    [
                        'title' => 'Gratitude Prayer 2',
                        'prayer' => 'Thank You for being our Great Physician, for healing known and unknown battles, for restoring strength and vitality daily!',
                    ],
                    [
                        'title' => 'Gratitude Prayer 3',
                        'prayer' => 'Thank You because the enemy\'s plan to cut us off is eternally frustrated! We live to declare Your goodness across the earth!',
                    ],
                    [
                        'title' => 'Prophetic Sealing',
                        'prayer' => 'By the Blood of Jesus, I seal our lives, our destinies, our children (born and unborn), and our loved ones in the covenant of health and long life! I decree: Not one of us shall be cut down in our prime! We shall live strong, live long, and fulfill every divine assignment gloriously! In Jesus\' mighty Name! Amen and Amen!',
                    ],
                ],
            ],

        ]);
    }
}
