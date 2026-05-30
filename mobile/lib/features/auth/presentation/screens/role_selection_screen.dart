import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/shared/widgets/skeuo_button.dart';
import 'package:mobile/shared/widgets/skeuo_card.dart';

class RoleSelectionScreen extends StatefulWidget {
  const RoleSelectionScreen({super.key});

  @override
  State<RoleSelectionScreen> createState() => _RoleSelectionScreenState();
}

class _RoleSelectionScreenState extends State<RoleSelectionScreen> {
  String? _selectedRole;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Sign Up', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        actions: [
          TextButton(
            onPressed: () => context.go('/login'),
            child: const Text('Log In', style: TextStyle(color: AppColors.primary)),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const SizedBox(height: 16),
            Text(
              'Select Your Role',
              style: Theme.of(context).textTheme.headlineLarge,
            ),
            const SizedBox(height: 32),
            Row(
              children: [
                Expanded(
                  child: RoleCard(
                    title: 'Student',
                    icon: Icons.school,
                    isSelected: _selectedRole == 'student',
                    onTap: () => setState(() => _selectedRole = 'student'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: RoleCard(
                    title: 'Lecturer',
                    icon: Icons.history_edu,
                    isSelected: _selectedRole == 'lecturer',
                    onTap: () => setState(() => _selectedRole = 'lecturer'),
                  ),
                ),
              ],
            ),
            const Spacer(),
            SkeuoButton(
              text: 'Continue',
              onPressed: _selectedRole != null ? () => context.push('/signup') : () {},
              suffixIcon: const Icon(Icons.arrow_forward),
            ),
          ],
        ),
      ),
    );
  }
}

class RoleCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const RoleCard({
    super.key,
    required this.title,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SkeuoCard(
        color: isSelected ? AppColors.surfaceHighest : AppColors.surfaceDark,
        borderRadius: BorderRadius.circular(16),
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.primary.withOpacity(0.1),
              ),
              child: Icon(icon, color: AppColors.primary, size: 40),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            if (isSelected) ...[
              const SizedBox(height: 8),
              const Icon(Icons.check_circle, color: AppColors.primary, size: 24),
            ],
          ],
        ),
      ),
    );
  }
}
