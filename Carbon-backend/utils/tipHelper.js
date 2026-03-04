const Tip = require("../models/Tip");


const getTipsDistribution = (categoryCount) => {
  if (categoryCount === 1) {
    return [5]; 
  } else if (categoryCount === 2) {
    return [3, 2];
  } else {
    return [2, 2, 1]; 
  }
};

const getPersonalizedTips = async (sortedCategories) => {
  const personalizedTips = [];
  const categoryCount = sortedCategories.length;

  if (categoryCount > 0) {
    const distribution = getTipsDistribution(categoryCount);

    for (let i = 0; i < Math.min(distribution.length, categoryCount); i++) {
      const category = sortedCategories[i].category;
      const tipCount = distribution[i];

      // Fetch tips for this category
      const categoryTips = await Tip.find({ category }).limit(tipCount);

      // Add tips with category context
      categoryTips.forEach(tip => {
        personalizedTips.push({
          category: tip.category,
          message: tip.message,
          priority: i + 1 // 1 = highest emission category
        });
      });
    }

    // If not enough tips from activity categories, add general tips
    const totalTipsNeeded = distribution.reduce((a, b) => a + b, 0);
    if (personalizedTips.length < totalTipsNeeded) {
      const remainingCount = totalTipsNeeded - personalizedTips.length;
      const generalTips = await Tip.find({ category: "general" }).limit(remainingCount);

      generalTips.forEach(tip => {
        personalizedTips.push({
          category: tip.category,
          message: tip.message,
          priority: categoryCount + 1 // Lower priority than activity categories
        });
      });
    }
  } else {
    // No activities - return general tips
    const generalTips = await Tip.find({ category: "general" }).limit(5);
    generalTips.forEach(tip => {
      personalizedTips.push({
        category: tip.category,
        message: tip.message,
        priority: 1
      });
    });
  }

  return personalizedTips;
};

module.exports = {
  getTipsDistribution,
  getPersonalizedTips
};
