package com.betamax.core.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.betamax.core.ui.theme.*

@Composable
fun TerminalScreen() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .padding(16.dp)
    ) {
        RetroWindow {
            TerminalContent()
        }
    }
}

@Composable
fun RetroWindow(content: @Composable () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .border(2.dp, Brush.verticalGradient(listOf(Fuchsia500, Cyan500)), RoundedCornerShape(8.dp))
            .clip(RoundedCornerShape(8.dp))
    ) {
        // Window Title Bar
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(32.dp)
                .background(Brush.horizontalGradient(listOf(Fuchsia900, Slate900)))
                .padding(horizontal = 8.dp)
        ) {
            Row(
                modifier = Modifier.align(Alignment.CenterStart),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                WindowButton(Color(0xFFFF5F57))
                WindowButton(Color(0xFFFFBD2E))
                WindowButton(Color(0xFF28C940))
            }
            Text(
                "TERMINAL_CLI // V2.0",
                color = Color.White,
                fontFamily = FontFamily.Monospace,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.align(Alignment.Center)
            )
        }
        
        // Window Content (CRT Effect container)
        Box(
            modifier = Modifier
                .weight(1f)
                .background(Color.Black.copy(alpha = 0.9f))
        ) {
            content()
            // Scanline overlay mock
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(
                                Color.Transparent,
                                Color.Black.copy(alpha = 0.1f)
                            ),
                            startY = 0f,
                            endY = 4f // simulated repeat
                        )
                    )
            )
        }
    }
}

@Composable
fun WindowButton(color: Color) {
    Box(
        modifier = Modifier
            .size(10.dp)
            .clip(RoundedCornerShape(50))
            .background(color)
    )
}

@Composable
fun TerminalContent() {
    var input by remember { mutableStateOf("") }
    var lines by remember { mutableStateOf(listOf(
        "BETA MAX [Version 2.0.0 NATIVE]",
        "(c) 2026 Damien Nichols. All rights reserved.",
        "",
        "Authenticating...",
        "User_Zero detected. Access Level 3 granted.",
        "Type 'help' for available commands.",
        ""
    )) }
    
    val listState = rememberLazyListState()

    LaunchedEffect(lines) {
        listState.animateScrollToItem(lines.size - 1)
    }

    fun executeCommand(cmd: String) {
        val newLines = lines.toMutableList()
        newLines.add("> $cmd")
        
        when (cmd.lowercase()) {
            "help" -> {
                newLines.add("AVAILABLE COMMANDS:")
                newLines.add("  scan [target]    - Scan repository for anomalies")
                newLines.add("  clear            - Clear terminal screen")
            }
            "clear" -> {
                lines = listOf()
                input = ""
                return
            }
            else -> newLines.add("ERR: Command '$cmd' not recognized.")
        }
        
        lines = newLines
        input = ""
    }

    Column(modifier = Modifier.padding(16.dp)) {
        LazyColumn(
            modifier = Modifier.weight(1f),
            state = listState
        ) {
            items(lines) { line ->
                Text(
                    text = line,
                    color = Fuchsia500,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )
            }
        }
        
        Row(modifier = Modifier.padding(top = 8.dp)) {
            Text(">", color = Fuchsia500, modifier = Modifier.padding(end = 8.dp), fontFamily = FontFamily.Monospace)
            BasicTextField(
                value = input,
                onValueChange = { input = it },
                textStyle = TextStyle(
                    color = Fuchsia500,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 14.sp
                ),
                cursorBrush = SolidColor(Fuchsia500),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(onDone = { executeCommand(input) }),
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}