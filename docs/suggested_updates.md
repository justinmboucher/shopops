# Suggested Model Updates for Future ML & Analytics

This document outlines all recommended enhancements to support advanced analytics, forecasting, and machine learning within ShopOps. These changes are optional and can be implemented gradually. They are grouped by model for clarity.

---

# 1. Project Model Enhancements

Adding lifecycle timestamps greatly improves the ability to model:

- project duration  
- time-to-completion  
- cancellation risk  
- seasonal patterns  
- customer responsiveness  
- workflow bottlenecks  

### Recommended new fields

```python
completed_at = models.DateTimeField(null=True, blank=True)
started_at = models.DateTimeField(null=True, blank=True)
confirmed_at = models.DateTimeField(null=True, blank=True)   # when the customer commits or pays deposit
quoted_at = models.DateTimeField(null=True, blank=True)      # when quote was sent
```

# 2. Sale Model Enhancements

Accurate ML-driven profitability modeling requires storing cost and margin at time of sale, not recalculating from updated inventory costs in the future.

### Minimal recommended fields
```python
cost_of_goods = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
gross_margin = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
```

### Optional detailed cost breakdown
```python
platform_fees = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
tax_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
```

Detailed breakdown enables rich channel-based profitability insights.

# 3. Product Template Enhancements (Optional)

If you want to improve prediction around material consumption and cost behavior, consider adding:

```python
average_material_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
average_consumable_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
```

These are optional but help if you build a recommendation engine (e.g., “optimal price based on past similar builds”).

# 4. WorkLog Model (Per-Stage Time Tracking)

This is extremely helpful if you want ML to:

- identify workflow bottlenecks

- predict stage-level delays

- improve labor estimation accuracy

- recommend workflow optimizations

### Suggested WorkLog model
```python
class WorkLog(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="work_logs")
    stage = models.ForeignKey(WorkflowStage, on_delete=models.SET_NULL, null=True, blank=True)
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField()
    notes = models.TextField(blank=True)
```

This enables very fine-grained time-series modeling per workflow stage.

# 5. SaleCostSnapshot Model (Historical Cost Freeze)

When a sale is completed, it’s often useful to freeze the costs so they never change even if inventory prices update later.

### Suggested SaleCostSnapshot model
```python
class SaleCostSnapshot(models.Model):
    sale = models.OneToOneField(Sale, on_delete=models.CASCADE, related_name="cost_snapshot")
    material_cost = models.DecimalField(max_digits=10, decimal_places=2)
    labor_cost = models.DecimalField(max_digits=10, decimal_places=2)
    consumables_cost = models.DecimalField(max_digits=10, decimal_places=2)
    overhead_cost = models.DecimalField(max_digits=10, decimal_places=2)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
```

Supports:

- stable margin analysis

- long-term profitability studies

- pricing optimization models