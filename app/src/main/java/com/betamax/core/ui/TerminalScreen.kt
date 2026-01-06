package com.betamax.core.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.betamax.core.ui.theme.Fuchsia500

@Composable
fun TerminalScreen() {
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

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .padding(16.dp)
    ) {
        LazyColumn(
            modifier = Modifier.weight(1f),
            state = listState
        ) {
            items(lines) { line ->
                Text(
                    text = line,
                    color = Fuchsia500.copy(alpha = 0.8f),
                    fontFamily = FontFamily.Monospace,
                    fontSize = 14.sp
                )
            }
        }
        
        Row(modifier = Modifier.padding(top = 8.dp)) {
            Text(">", color = Fuchsia500, modifier = Modifier.padding(end = 8.dp))
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
