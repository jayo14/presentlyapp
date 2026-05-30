import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class SkeuoTextField extends StatelessWidget {
  final String label;
  final String placeholder;
  final bool isPassword;
  final TextEditingController? controller;
  final Widget? suffixIcon;

  const SkeuoTextField({
    super.key,
    required this.label,
    required this.placeholder,
    this.isPassword = false,
    this.controller,
    this.suffixIcon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            label,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
          ),
        ),
        TextField(
          controller: controller,
          obscureText: isPassword,
          style: const TextStyle(color: AppColors.textLight),
          decoration: InputDecoration(
            hintText: placeholder,
            suffixIcon: suffixIcon,
          ),
        ),
      ],
    );
  }
}
