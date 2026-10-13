import re

claim = 'Software engineer at Google 3 years'
verified = 'Software Engineer at Google 2019-2022 distributed systems Kubernetes'

claim_lower = claim.lower()
verified_lower = verified.lower()
claim_kw = [t for t in re.split(r'[^a-z0-9]+', claim_lower) if len(t) >= 4]
verified_kw = set(t for t in re.split(r'[^a-z0-9]+', verified_lower) if len(t) >= 4)
unmatched = [t for t in claim_kw if t not in verified_kw and t not in verified_lower]

print('LEGIT MATCH DEBUG')
print('claim_keywords:', claim_kw)
print('verified_keywords:', sorted(verified_kw))
print('unmatched:', unmatched)
ratio = len(unmatched) / max(1, len(claim_kw))
print(f'ratio: {ratio:.2f}')
mismatch = 0 if len(unmatched) == 0 else (1 if ratio < 0.5 else (2 if ratio < 0.75 else 4))
print('mismatch count:', mismatch)

print()
# Test case 3: fraud mismatch
claim2 = 'CEO at Amazon for 10 years managing 5000 employees'
verified2 = 'Junior developer at small startup 2022-2023'
claim_kw2 = [t for t in re.split(r'[^a-z0-9]+', claim2.lower()) if len(t) >= 4]
verified_kw2 = set(t for t in re.split(r'[^a-z0-9]+', verified2.lower()) if len(t) >= 4)
unmatched2 = [t for t in claim_kw2 if t not in verified_kw2 and t not in verified2.lower()]
ratio2 = len(unmatched2) / max(1, len(claim_kw2))
mismatch2 = 0 if not unmatched2 else (1 if ratio2 < 0.5 else (2 if ratio2 < 0.75 else 4))
print('FRAUD MISMATCH DEBUG')
print('claim_keywords:', claim_kw2)
print('verified_keywords:', sorted(verified_kw2))
print('unmatched:', unmatched2)
print(f'ratio: {ratio2:.2f}, mismatch count: {mismatch2}')
