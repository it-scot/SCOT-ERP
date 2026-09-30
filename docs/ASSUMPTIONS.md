# SCoT ERP - Assumptions Record

1. **Four Levels of Evaluation Results**: 
   - The results are grouped as: Self, Peer, Superior (HOD/COO), and Final Composite. An optional "Direct Supervisor" pillar is supported by config but off by default.
   
2. **Notification Recipients for Joiners**: 
   - The truncated notification recipient in the joiner step is treated as `it@scot.lk` + `admin@scot.lk` (configurable).

3. **Asset Template Formatting**: 
   - Asset template column labels were inferred from unlabeled values in the prompt. Templates are built as flexible line items (Label, Spec, Quantity, Required).

4. **COO Evaluation Exemption**: 
   - The COO is not evaluated in v1 of the 360 evaluation system.

5. **Data Privacy / Salary**: 
   - Salary data is hidden from IT even though IT users have access to the System Admin Dashboard.

6. **Attendance Thresholds**: 
   - "Late" is defined as more than 15 minutes after shift start. 
   - "OT threshold" is defined as 30 minutes after shift end.
   - Default weights, SLAs, and bands are configurable placeholders.

7. **Access Revocation**: 
   - Employee portal access is revoked at the moment of service-letter acceptance (configurable to last working day).

8. **Public Holidays**: 
   - Public holiday dates are placeholders to be confirmed by HR.

9. **Dev Mode Mocking**:
   - The UI components use `@tanstack/react-query` calling our local mock-backed Express API endpoints. For any missing minor endpoint routes not explicitly created in the backend step, the frontend uses temporary fallback data structures or graceful degradation so the UI never crashes and remains fully demonstrable.
