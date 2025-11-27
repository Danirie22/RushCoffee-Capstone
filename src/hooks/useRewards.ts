import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { AvailableReward } from '../data/mockRewards';
import { mockAvailableRewards } from '../data/mockAvailableRewards';

export const useRewards = () => {
    const [rewards, setRewards] = useState<AvailableReward[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRewards = async () => {
            try {
                const rewardsCollectionRef = db.collection('rewards');
                const snapshot = await rewardsCollectionRef.get();

                if (snapshot.empty) {
                    console.log("Seeding available rewards...");
                    const promises = mockAvailableRewards.map(reward => rewardsCollectionRef.add(reward));
                    await Promise.all(promises);

                    // Fetch again after seeding
                    const newSnapshot = await rewardsCollectionRef.orderBy('displayOrder').get();
                    const rewardsList = newSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as AvailableReward[];
                    setRewards(rewardsList);
                } else {
                    const rewardsList = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as AvailableReward[];

                    // SYNC: Update image URLs from mock data if they differ (to ensure local assets work)
                    const updates = [];
                    for (const reward of rewardsList) {
                        const mock = mockAvailableRewards.find(m => m.name === reward.name);
                        if (mock && mock.imageUrl !== reward.imageUrl) {
                            console.log(`Updating image for ${reward.name}...`);
                            updates.push(rewardsCollectionRef.doc(reward.id).update({ imageUrl: mock.imageUrl }));
                            reward.imageUrl = mock.imageUrl; // Update local state immediately
                        }
                    }
                    if (updates.length > 0) await Promise.all(updates);

                    // Sort locally just in case
                    rewardsList.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                    setRewards(rewardsList);
                }
            } catch (err: any) {
                console.error("Error fetching rewards:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRewards();
    }, []);

    return { rewards, loading, error };
};
