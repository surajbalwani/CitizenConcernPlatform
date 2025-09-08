# Reward System & SDG Integration - Implementation Guide

## Overview

A guide to Reward System and SDG (Sustainable Development Goals) tracking features in the Citizen Concern Platform.

## 🏆 Reward System

### Point Structure

| Action             | Points | Bonus Conditions                   |
| ------------------ | ------ | ---------------------------------- |
| Concern Submission | 10     | +15 for high priority (4-5)        |
| First Concern      | 20     | One-time bonus for new users       |
| Concern Resolved   | 50     | +10 for quick resolution (<7 days) |
| Officer Resolution | 25     | +5 for quick resolution (<7 days)  |
| Upvote             | 2      | Limited to once per concern        |
| Downvote           | 1      | Limited to once per concern        |
| Comment            | 3      | Max 3 rewards per concern          |
| Official Comment   | 5      | Max 3 rewards per concern          |

### Anti-Spam Protection

- **Voting**: One reward per user per concern
- **Comments**: Maximum 3 comment rewards per concern per user
- **Quality Validation**: Points only awarded for valid actions

### SDG Mappings

**Pre-seeded SDG Goals:**

1. **SDG 3**: Good Health and Well-being
2. **SDG 6**: Clean Water and Sanitation
3. **SDG 11**: Sustainable Cities and Communities
4. **SDG 13**: Climate Action

**Category-to-SDG Mapping:**

```csharp
private readonly Dictionary<string, List<int>> _categoryToSDGMapping = new()
{
    { "Health", new List<int> { 1 } },           // SDG 3
    { "Water", new List<int> { 2 } },            // SDG 6
    { "Sanitation", new List<int> { 2 } },       // SDG 6
    { "Roads", new List<int> { 3 } },            // SDG 11
    { "Transport", new List<int> { 3 } },        // SDG 11
    { "Housing", new List<int> { 3 } },          // SDG 11
    { "Infrastructure", new List<int> { 3 } },   // SDG 11
    { "Environment", new List<int> { 4 } },      // SDG 13
    { "Electricity", new List<int> { 3, 4 } },   // SDG 11 & 13
    { "Safety", new List<int> { 3 } }            // SDG 11
};
```

**Keyword-based Detection:**

```csharp
private readonly Dictionary<int, List<string>> _sdgKeywords = new()
{
    { 1, new List<string> { "health", "medical", "hospital", "clinic", "disease", "medicine", "healthcare", "ambulance", "doctor" } },
    { 2, new List<string> { "water", "sanitation", "sewage", "drainage", "toilet", "hygiene", "waste", "clean water", "drinking water" } },
    { 3, new List<string> { "city", "urban", "housing", "transport", "infrastructure", "road", "building", "community", "public space", "accessibility" } },
    { 4, new List<string> { "climate", "environment", "pollution", "carbon", "green", "renewable", "sustainable", "emission", "air quality", "flooding" } }
};
```

### Progress Calculation

**Automatic Metrics:**

- **Related Concerns**: Total concerns mapped to each SDG
- **Resolved Concerns**: Successfully addressed issues
- **Progress Percentage**: `(Resolved / Related) * 100`
- **Last Updated**: Real-time timestamp

## 📊 Analytics Integration

### Dashboard Metrics

Both reward and SDG systems integrate with the existing analytics dashboard:

- **User Dashboard**: Shows reward points and history
- **Admin Dashboard**: Shows SDG progress and reward system analytics
- **Analytics API**: Exposes metrics for reporting

### Reports Available

- **Reward Leaderboards**: Top engaged citizens
- **SDG Progress Reports**: Goal achievement tracking
- **Engagement Analytics**: Citizen participation metrics
- **Performance Metrics**: Officer reward and resolution stats

## 🚀 Future Enhancements

### Reward System

- **Redemption Store**: Physical rewards for points
- **Leaderboards**: Public recognition systems
- **Seasonal Campaigns**: Bonus point events
- **Team Challenges**: Group engagement features

### SDG Integration

- **Advanced Mapping**: Machine learning for better categorization
- **Impact Scoring**: Quantified improvement metrics
- **Cross-SDG Analysis**: Multi-goal impact tracking
- **Reporting Dashboard**: Visual SDG progress for stakeholders

## 🔒 Security Considerations

- **Point Integrity**: Server-side validation prevents tampering
- **Rate Limiting**: Anti-spam protection on all reward actions
- **Audit Trail**: Complete logging of all reward transactions
- **Role-based Access**: SDG management limited to authorized users
