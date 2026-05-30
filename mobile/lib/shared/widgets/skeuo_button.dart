import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';

class SkeuoButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final Color? color;
  final Color? textColor;
  final bool isFullWidth;
  final Widget? suffixIcon;
  final bool isOutlined;

  const SkeuoButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.color,
    this.textColor,
    this.isFullWidth = true,
    this.suffixIcon,
    this.isOutlined = false,
  });

  @override
  Widget build(BuildContext context) {
    Widget buttonContent = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          text,
          style: Theme.of(context).textTheme.labelLarge?.copyWith(
                color: textColor ?? (isOutlined ? AppColors.primary : AppColors.backgroundDark),
              ),
        ),
        if (suffixIcon != null) ...[
          const SizedBox(width: 8),
          suffixIcon!,
        ],
      ],
    );

    return Container(
      width: isFullWidth ? double.infinity : null,
      height: 56,
      decoration: isOutlined
          ? BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.primary, width: 2),
            )
          : AppTheme.skeuoButton.copyWith(
              color: color ?? AppColors.primary,
            ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: buttonContent,
          ),
        ),
      ),
    );
  }
}
